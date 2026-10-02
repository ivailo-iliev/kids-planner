import base64
import json
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EXPECTED_FONT_SHA256 = "b57ed895ae9d09ba7b4b19c343a75cf39aad57156c3450e339d9d11556d7edc1"
NODE_PROBE = r"""
const crypto = require("crypto");
const handler = require("./netlify/functions/device-css.js").handler;
const request = JSON.parse(process.argv[1]);
handler({
  headers: { "user-agent": request.userAgent },
  queryStringParameters: request.query
}).then((response) => {
  const match = response.body.match(/data:font\/ttf;base64,([A-Za-z0-9+/=]+)/);
  const diagnostics = /application\/json/i.test(response.headers["Content-Type"] || "")
    ? JSON.parse(response.body)
    : null;
  process.stdout.write(JSON.stringify({
    statusCode: response.statusCode,
    contentType: response.headers["Content-Type"],
    diagnostics,
    hasEmbeddedFont: !!match,
    fontHash: match
      ? crypto.createHash("sha256").update(Buffer.from(match[1], "base64")).digest("hex")
      : null,
    hasLayoutCss: /table-layout: fixed/.test(response.body),
    referencesExternalFont: /emoji-font/.test(response.body)
  }));
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
"""

FONT_DATA_PROBE = r"""
const crypto = require("crypto");
const handler = require("./netlify/functions/device-css.js").handler;
handler({
  headers: { "user-agent": "Mozilla/5.0 (X11; Linux x86_64)" },
  queryStringParameters: { font_data: "1" }
}).then((response) => {
  const bytes = Buffer.from(response.body, "base64");
  process.stdout.write(JSON.stringify({
    statusCode: response.statusCode,
    contentType: response.headers["Content-Type"],
    isBase64Encoded: !!response.isBase64Encoded,
    fontHash: crypto.createHash("sha256").update(bytes).digest("hex")
  }));
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
"""

KINDLE_UA_PROBE = r"""
const fs = require("fs");
const vm = require("vm");
const source = fs.readFileSync("./test.html", "utf8");
const match = source.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i);
if (!match) throw new Error("page initialization script not found");
const request = JSON.parse(process.argv[1]);
function classFor(userAgent, search) {
  const context = {
    window: { location: { search } },
    navigator: { userAgent },
    document: { documentElement: { className: "" } }
  };
  vm.runInNewContext(match[1], context);
  return context.document.documentElement.className;
}
process.stdout.write(JSON.stringify({
  legacyKindle: classFor(request.legacyUserAgent, ""),
  genericLinux: classFor(request.genericUserAgent, ""),
  diagnosticMode: classFor(request.legacyUserAgent, "?font-diagnostics=1")
}));
"""


class FontDiagnosticTests(unittest.TestCase):
    def request_probe(self, user_agent, query):
        result = subprocess.run(
            ["node", "-e", NODE_PROBE, json.dumps({"userAgent": user_agent, "query": query})],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        return json.loads(result.stdout)

    def test_embedded_font_data_endpoint_returns_the_expected_plain_base64(self):
        result = subprocess.run(
            ["node", "-e", FONT_DATA_PROBE],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        response = json.loads(result.stdout)

        self.assertEqual(response["statusCode"], 200)
        self.assertTrue(response["contentType"].startswith("text/plain"))
        self.assertFalse(response["isBase64Encoded"])
        self.assertEqual(response["fontHash"], EXPECTED_FONT_SHA256)

    def test_client_detects_legacy_kindle_user_agent_and_uses_same_origin_font(self):
        source = (ROOT / "test.html").read_text(encoding="utf-8")
        self.assertIn("function isLegacyKindleUserAgent", source)
        result = subprocess.run(
            [
                "node",
                "-e",
                KINDLE_UA_PROBE,
                json.dumps(
                    {
                        "legacyUserAgent": (
                            "Mozilla/5.0 (X11; ; U; Linux armv7l; en-gb) "
                            "AppleWebKit/534.26+ (KHTML, like Gecko) "
                            "Version/5.0 Safari/534.26+"
                        ),
                        "genericUserAgent": (
                            "Mozilla/5.0 (X11; Linux x86_64) "
                            "AppleWebKit/537.36 Chrome/120.0 Safari/537.36"
                        ),
                    }
                ),
            ],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )

        self.assertEqual(
            json.loads(result.stdout),
            {"legacyKindle": "kindle-emoji", "genericLinux": "", "diagnosticMode": ""},
        )
        self.assertIn('src: url("/.netlify/functions/emoji-font") format("truetype")', source)
        self.assertIn(".kindle-emoji .emoji", source)
        self.assertIn('isLegacyKindleUserAgent(navigator.userAgent || "")', source)

    def test_server_diagnostics_echo_the_request_user_agent_and_detection(self):
        user_agent = "Mozilla/5.0 Kindle/5.12.2.2"
        result = self.request_probe(user_agent, {"diagnostics": "1"})

        self.assertEqual(result["statusCode"], 200)
        self.assertTrue(result["contentType"].startswith("application/json"))
        self.assertEqual(result["diagnostics"]["serverUserAgent"], user_agent)
        self.assertTrue(result["diagnostics"]["isKindleEInk"])

    def test_server_diagnostics_show_when_kindle_detection_fails(self):
        user_agent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
        result = self.request_probe(user_agent, {"diagnostics": "1"})

        self.assertEqual(result["diagnostics"]["serverUserAgent"], user_agent)
        self.assertFalse(result["diagnostics"]["isKindleEInk"])

    def test_font_test_mode_embeds_ttf_even_without_kindle_detection(self):
        result = self.request_probe(
            "Mozilla/5.0 (X11; Linux x86_64)",
            {"font_test": "1", "font_only": "1"},
        )

        self.assertEqual(result["statusCode"], 200)
        self.assertTrue(result["hasEmbeddedFont"])
        self.assertEqual(result["fontHash"], EXPECTED_FONT_SHA256)
        self.assertFalse(result["hasLayoutCss"])

    def test_default_kindle_stylesheet_uses_the_smaller_font_url_variant(self):
        result = self.request_probe("Mozilla/5.0 Kindle/5.12.2.2", {})

        self.assertEqual(result["statusCode"], 200)
        self.assertFalse(result["hasEmbeddedFont"])
        self.assertTrue(result["referencesExternalFont"])
        self.assertTrue(result["hasLayoutCss"])

    def test_cached_font_mode_status_and_older_requests_cannot_overwrite_the_current_choice(self):
        source = (ROOT / "test.html").read_text(encoding="utf-8")
        start = source.index("function applyFontMode(mode)")
        end = source.index("function loadServerDiagnostics()", start)
        apply_mode = source[start:end]

        loading = apply_mode.index('fontStatus("loading embedded font data for " + mode)')
        request = apply_mode.index("loadFontData(function (error, base64)")
        self.assertLess(loading, request)
        self.assertIn("if (activeFontMode !== mode) return;", apply_mode)
        self.assertIn('id="css-status"', source)
        self.assertIn("cssLink.sheet", source)
        self.assertIn("dataCssState", source)

    def test_diagnostic_page_exposes_user_agents_font_variants_and_layout_metrics(self):
        source = (ROOT / "test.html").read_text(encoding="utf-8")

        for required in (
            "navigator.userAgent",
            'id="client-ua"',
            'id="server-ua"',
            'id="layout-metrics"',
            'id="font-mode"',
            "application/x-font-ttf",
            "application/font-sfnt",
            "application/octet-stream",
            "font/ttf",
            "/.netlify/functions/emoji-font",
            "font_test=1",
            "font-diagnostics=1",
        ):
            with self.subTest(required=required):
                self.assertIn(required, source)

        self.assertIn('id="routine-table"', source)
        self.assertEqual(source.count('class="routine"'), 2)

    def test_waf_launches_the_routine_view_without_font_diagnostics(self):
        source = (ROOT / "kindle/waf/kidsplanner/index.html").read_text(encoding="utf-8")
        self.assertIn('src="https://kids-planner.netlify.app/test.html"', source)
        self.assertNotIn("font-diagnostics=1", source)


if __name__ == "__main__":
    unittest.main()
