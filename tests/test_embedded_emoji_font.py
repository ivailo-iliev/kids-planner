import json
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EXPECTED_FONT_SHA256 = "b57ed895ae9d09ba7b4b19c343a75cf39aad57156c3450e339d9d11556d7edc1"
NODE_PROBE = r"""
const crypto = require("crypto");
const handler = require("./netlify/functions/device-css.js").handler;
const userAgent = process.argv[1];
handler({ headers: { "user-agent": userAgent } }).then((response) => {
  const match = response.body.match(/data:font\/ttf;base64,([A-Za-z0-9+/=]+)/);
  const fontHash = match
    ? crypto.createHash("sha256").update(Buffer.from(match[1], "base64")).digest("hex")
    : null;
  process.stdout.write(JSON.stringify({
    statusCode: response.statusCode,
    hasEmbeddedFont: !!match,
    fontHash,
    referencesExternalFont: /emoji-font/.test(response.body)
  }));
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
"""


class EmbeddedEmojiFontTests(unittest.TestCase):
    def css_probe(self, user_agent):
        result = subprocess.run(
            ["node", "-e", NODE_PROBE, user_agent],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        return json.loads(result.stdout)

    def test_kindle_css_embeds_the_expected_ttf_font(self):
        result = self.css_probe("Mozilla/5.0 Kindle/5.12.2.2")

        self.assertEqual(result["statusCode"], 200)
        self.assertTrue(result["hasEmbeddedFont"])
        self.assertEqual(result["fontHash"], EXPECTED_FONT_SHA256)
        self.assertFalse(result["referencesExternalFont"])

    def test_non_kindle_css_does_not_include_the_large_font_data_uri(self):
        result = self.css_probe(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0 Safari/537.36"
        )

        self.assertEqual(result["statusCode"], 200)
        self.assertFalse(result["hasEmbeddedFont"])
        self.assertFalse(result["referencesExternalFont"])


if __name__ == "__main__":
    unittest.main()
