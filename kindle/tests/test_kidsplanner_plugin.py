from pathlib import Path
import unittest


PLUGIN = Path(__file__).resolve().parents[1] / "kidsplanner.koplugin"


class KidsPlannerPluginContractTests(unittest.TestCase):
    def test_plugin_metadata_names_kids_planner(self):
        metadata = PLUGIN / "_meta.lua"
        self.assertTrue(metadata.is_file(), "KOReader plugin metadata is missing")
        source = metadata.read_text(encoding="utf-8")
        self.assertIn('fullname = _("Kids Planner")', source)

    def test_plugin_adds_a_main_menu_entry(self):
        main = PLUGIN / "main.lua"
        self.assertTrue(main.is_file(), "KOReader plugin entry point is missing")
        source = main.read_text(encoding="utf-8")
        self.assertIn("registerToMainMenu(self)", source)
        self.assertIn("menu_items.kidsplanner", source)
        self.assertIn('text = _("Kids Planner")', source)
        self.assertIn("UIManager:show(KidsPlannerPage:new", source)

    def test_title_uses_a_supported_ko_reader_font_face(self):
        main = PLUGIN / "main.lua"
        self.assertTrue(main.is_file(), "KOReader plugin entry point is missing")
        source = main.read_text(encoding="utf-8")
        self.assertIn('Font:getFace("tfont")', source)

    def test_page_is_full_screen_and_has_an_exit_action(self):
        main = PLUGIN / "main.lua"
        self.assertTrue(main.is_file(), "KOReader plugin entry point is missing")
        source = main.read_text(encoding="utf-8")
        self.assertIn("covers_fullscreen = true", source)
        self.assertIn("background = Blitbuffer.COLOR_WHITE", source)
        self.assertIn('text = _("Exit")', source)
        self.assertIn("UIManager:close(self)", source)


if __name__ == "__main__":
    unittest.main()
