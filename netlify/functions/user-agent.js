exports.handler = async function (event) {
  var headers = event.headers || {};
  var userAgent =
    headers["user-agent"] ||
    headers["User-Agent"] ||
    "";

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify({
      userAgent: userAgent
    })
  };
};
