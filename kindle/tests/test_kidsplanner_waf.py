from pathlib import Path
from zipfile import ZipFile
import unittest
import xml.etree.ElementTree as ET


KINDLE = Path(__file__).resolve().parents[1]
WAF = KINDLE / "waf/kidsplanner"
EXTENSION = KINDLE / "waf/extension/KidsPlanner"


class KidsPlannerWAFTests(unittest.TestCase):
    def test_waf_and_extension_versions_are_bumped_together(self):
        ns = {"w": "http://www.w3.org/ns/widgets"}
        waf = ET.parse(WAF / "config.xml").getroot()
        extension = ET.parse(EXTENSION / "config.xml").getroot()
        self.assertEqual(waf.attrib["version"], "1.0.10")
        self.assertEqual(extension.findtext("information/version"), "1.0.10")

    def test_built_packages_match_the_current_waf_and_extension_sources(self):
        kual_package = KINDLE / "build/KidsPlanner-KUAL-extension.zip"
        waf_package = KINDLE / "build/KidsPlanner-WAF.zip"
        kual_sources = {
            "KidsPlanner/config.xml": EXTENSION / "config.xml",
            "KidsPlanner/install.sh": EXTENSION / "install.sh",
            "KidsPlanner/menu.json": EXTENSION / "menu.json",
            "KidsPlanner/waf/config.xml": WAF / "config.xml",
            "KidsPlanner/waf/index.html": WAF / "index.html",
        }
        waf_sources = {
            "kidsplanner/config.xml": WAF / "config.xml",
            "kidsplanner/index.html": WAF / "index.html",
        }

        with ZipFile(kual_package) as archive:
            for member, source in kual_sources.items():
                self.assertEqual(archive.read(member), source.read_bytes(), member)
        with ZipFile(waf_package) as archive:
            for member, source in waf_sources.items():
                self.assertEqual(archive.read(member), source.read_bytes(), member)

    def test_manifest_uses_application_view_mode(self):
        root = ET.parse(WAF / "config.xml").getroot()
        self.assertEqual(root.attrib["viewmodes"].split(), ["application"])

    def test_manifest_keeps_only_close_and_orientation_reset_apis(self):
        root = ET.parse(WAF / "config.xml").getroot()
        ns = {"k": "http://kindle.amazon.com/ns/widget-extensions"}
        params = {
            item.attrib["name"]: item.attrib["value"]
            for item in root.findall(".//{http://www.w3.org/ns/widgets}feature/{http://www.w3.org/ns/widgets}param")
        }
        self.assertEqual(params.get("appmgr"), "yes")
        self.assertEqual(params.get("dev"), "yes")
        self.assertNotIn("messaging", params)
        self.assertNotIn("chrome", params)
        self.assertIsNone(root.find("k:chrome", ns))
        self.assertIsNone(root.find("k:messaging", ns))

    def test_page_leaves_orientation_and_view_mode_to_kindle(self):
        source = (WAF / "index.html").read_text(encoding="utf-8")
        self.assertNotIn("setOrientation('landscape')", source)
        self.assertNotIn("switchViewMode", source)
        self.assertNotIn("configureChrome", source)
        self.assertNotIn("setTimeout", source)
        self.assertIn('src="https://kids-planner.netlify.app/test.html"', source)

    def test_installer_removes_experimental_registry_properties(self):
        source = (EXTENSION / "install.sh").read_text(encoding="utf-8")
        self.assertIn('WAF_VERSION="1.0.10"', source)
        self.assertIn("'supportedOrientation', 'default-chrome-style', 'searchbar-mode'", source)
        self.assertNotIn("orientationLock L", source)
        self.assertNotIn("disableEnablePillow", source)
        self.assertIn('"$APP_ID $WAF_VERSION"', source)
        self.assertIn('"SUCCESS: Kids Planner WAF $WAF_VERSION installed.', source)

    def test_close_restores_orientation_and_returns_home(self):
        source = (WAF / "index.html").read_text(encoding="utf-8")
        self.assertIn("setOrientation('auto')", source)
        self.assertIn("start('com.lab126.booklet.home')", source)

    def test_waf_loads_the_routine_view_without_diagnostics(self):
        source = (WAF / "index.html").read_text(encoding="utf-8")
        self.assertIn('src="https://kids-planner.netlify.app/test.html"', source)
        self.assertNotIn("font-diagnostics=1", source)

    def test_page_content_uses_the_full_viewport(self):
        source = (WAF / "index.html").read_text(encoding="utf-8")
        self.assertIn("width: 100%;", source)
        self.assertIn("height: 100%;", source)
        self.assertIn("id=\"planner\"", source)


if __name__ == "__main__":
    unittest.main()
