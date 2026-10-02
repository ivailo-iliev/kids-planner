from pathlib import Path
import unittest


class LegacySvgCompatibilityTests(unittest.TestCase):
    def test_precipitation_icon_has_legacy_xlink_reference(self):
        source = (Path(__file__).resolve().parents[1] / "index.html").read_text()
        weather_function = source.split("function updateWeather(data)", 1)[1].split(
            "function updateCalendarImages(data)", 1
        )[0]

        self.assertIn(
            "<use href=\"#' + precipitation + '\" "
            "xlink:href=\"#' + precipitation + '\"></use>",
            weather_function,
        )


if __name__ == "__main__":
    unittest.main()
