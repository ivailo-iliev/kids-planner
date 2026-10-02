from pathlib import Path
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
        self.assertEqual(waf.attrib["version"], "1.0.2")
        self.assertEqual(extension.findtext("information/version"), "1.0.2")

    def test_manifest_enables_orientation_and_fullscreen_apis(self):
        root = ET.parse(WAF / "config.xml").getroot()
        ns = {"k": "http://kindle.amazon.com/ns/widget-extensions"}
        params = {
            item.attrib["name"]: item.attrib["value"]
            for item in root.findall(".//{http://www.w3.org/ns/widgets}feature/{http://www.w3.org/ns/widgets}param")
        }
        self.assertEqual(params.get("dev"), "yes")
        self.assertEqual(params.get("messaging"), "yes")
        allowed_apps = {
            item.attrib["name"]: item.attrib["value"]
            for item in root.findall("k:messaging/k:app", ns)
        }
        self.assertEqual(allowed_apps.get("com.lab126.mfa"), "yes")

    def test_page_requests_landscape_and_fullscreen_at_startup(self):
        source = (WAF / "index.html").read_text(encoding="utf-8")
        self.assertIn("setOrientation('landscape')", source)
        self.assertIn("sendStringMessage('com.lab126.mfa', 'switchViewMode', 'fullscreen')", source)

    def test_installer_allows_rotation_and_reports_the_same_version(self):
        source = (EXTENSION / "install.sh").read_text(encoding="utf-8")
        self.assertIn('WAF_VERSION="1.0.2"', source)
        self.assertIn("'supportedOrientation', 'URL'", source)
        self.assertIn("orientationLock L", source)
        self.assertIn('"$APP_ID $WAF_VERSION"', source)
        self.assertIn('"SUCCESS: Kids Planner WAF $WAF_VERSION installed; landscape/fullscreen requested.', source)

    def test_close_restores_orientation_and_returns_home(self):
        source = (WAF / "index.html").read_text(encoding="utf-8")
        self.assertIn("setOrientation('auto')", source)
        self.assertIn("start('com.lab126.booklet.home')", source)

    def test_page_content_uses_the_full_viewport(self):
        source = (WAF / "index.html").read_text(encoding="utf-8")
        self.assertIn("width: 100%;", source)
        self.assertIn("height: 100%;", source)
        self.assertIn("id=\"planner\"", source)


if __name__ == "__main__":
    unittest.main()
