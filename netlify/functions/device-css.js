exports.handler = async function (event) {
  var headers = event.headers || {};
  var ua = headers["user-agent"] || headers["User-Agent"] || "";

  // E-ink Kindle requests identify themselves as Kindle/x.x in the HTTP UA.
  // Fire/Silk devices keep their native color emoji.
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
    'tr {',
    '  height: 50%;',
    '}',
    '',
    'td.routine {',
    '  text-align: left;',
    '  vertical-align: middle;',
    '  white-space: nowrap;',
    '  padding: 0 2%;',
    '  line-height: 1;',
    '}',
    '',
    '.person-icon,',
    '.emoji-item {',
    '  display: inline-block;',
    '  width: 1em;',
    '  text-align: center;',
    '  vertical-align: middle;',
    '}',
    '',
    '.person-icon {',
    '  margin-right: 0.35em;',
    '}',
    '',
    '.emoji-item {',
    '  margin-right: 0.18em;',
    '}',
    '',
    '.emoji-item.done .task-icon {',
    '  display: none;',
    '}',
    '',
    '.emoji-item.done:after {',
    '  content: "✅";',
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
      "Cache-Control": "no-cache",
      "Vary": "User-Agent"
    },
    body: css.join("\n")
  };
};
