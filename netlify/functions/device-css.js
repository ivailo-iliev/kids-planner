exports.handler = async function (event) {
  var headers = event.headers || {};
  var ua = headers["user-agent"] || headers["User-Agent"] || "";

  // E-ink Kindle browser requests include Kindle/x.x in the HTTP UA.
  // Exclude Silk so Fire tablets keep their native color emoji.
  var isKindleEInk = /Kindle\/[0-9.]+/i.test(ua) && !/Silk\//i.test(ua);

  var css = [
    '@font-face {',
    '  font-family: "Noto Emoji Kindle";',
    '  src: url("/.netlify/functions/emoji-font") format("truetype");',
    '  font-weight: normal;',
    '  font-style: normal;',
    '}',
    '',
    'html, body {',
    '  width: 100%;',
    '  height: 100%;',
    '  margin: 0;',
    '  padding: 0;',
    '}',
    '',
    'table {',
    '  width: 100%;',
    '  height: 100%;',
    '  table-layout: fixed;',
    '  border-collapse: collapse;',
    '}',
    '',
    'td {',
    '  width: 16.666%;',
    '  text-align: center;',
    '  vertical-align: middle;',
    '  font-size: 64px;',
    '  line-height: 1;',
    '  border: 1px solid #bbb;',
    '}'
  ];

  if (isKindleEInk) {
    css.push('');
    css.push('.emoji { font-family: "Noto Emoji Kindle", sans-serif; }');
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/css; charset=utf-8",
      "Cache-Control": "private, max-age=3600",
      "Vary": "User-Agent"
    },
    body: css.join("\n")
  };
};
