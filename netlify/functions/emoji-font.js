const fetch = require("node-fetch");

exports.handler = async function () {
  var url = "https://raw.githubusercontent.com/ghostlypi/NotoSans/main/NotoEmoji-Regular.ttf";
  var response = await fetch(url);

  if (!response.ok) {
    return {
      statusCode: 502,
      body: "Unable to load emoji font"
    };
  }

  var buffer = await response.buffer();

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "font/ttf",
      "Cache-Control": "public, max-age=31536000, immutable"
    },
    body: buffer.toString("base64"),
    isBase64Encoded: true
  };
};
