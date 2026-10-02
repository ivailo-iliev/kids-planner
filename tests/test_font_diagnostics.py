import json
import re
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class RoutinePageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = (ROOT / "test.html").read_text(encoding="utf-8")

    def test_two_full_width_rows_keep_existing_task_click_handlers(self):
        self.assertRegex(self.source, r'<table[^>]*width="100%"[^>]*height="100%"')
        self.assertEqual(re.findall(r'<tr\b[^>]*aria-label="([^"]+)"', self.source), ["Girl routine", "Boy routine"])
        self.assertEqual(self.source.count('onclick="return toggleDone(this)"'), 11)

    def test_only_github_font_fallback_and_two_client_functions_remain(self):
        self.assertIn("https://raw.githubusercontent.com/ghostlypi/NotoSans/main/NotoEmoji-Regular.ttf", self.source)
        self.assertIn('html.kindle-emoji .emoji { font-family: "Noto Emoji", sans-serif; }', self.source)
        self.assertNotIn("/.netlify/functions/", self.source)
        self.assertNotIn("diagnostic", self.source.lower())
        self.assertEqual(
            re.findall(r"\bfunction\s+([A-Za-z_$][\w$]*)\s*\(", self.source),
            ["toggleDone", "isLegacyKindleUserAgent"],
        )

    def test_done_toggle_and_kindle_detection(self):
        probe = r'''
const fs = require("fs");
const vm = require("vm");
const html = fs.readFileSync("test.html", "utf8");
const script = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i)[1];
function run(userAgent) {
  const root = { className: "" };
  const context = { document: { documentElement: root }, navigator: { userAgent } };
  vm.runInNewContext(script, context);
  const item = { className: "emoji-item" };
  context.toggleDone(item);
  const done = item.className;
  context.toggleDone(item);
  return { rootClass: root.className, done, undone: item.className };
}
process.stdout.write(JSON.stringify({
  kindle: run("Mozilla/5.0 (X11; ; U; Linux armv7l; en-gb) AppleWebKit/534.26+ (KHTML, like Gecko) Version/5.0 Safari/534.26+"),
  other: run("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36")
}));
'''
        result = subprocess.run(
            ["node", "-e", probe], cwd=ROOT, check=True, capture_output=True, text=True
        )
        states = json.loads(result.stdout)
        self.assertEqual(states["kindle"]["rootClass"], "kindle-emoji")
        self.assertEqual(states["other"]["rootClass"], "")
        self.assertIn("done", states["kindle"]["done"].split())
        self.assertNotIn("done", states["kindle"]["undone"].split())


if __name__ == "__main__":
    unittest.main()
