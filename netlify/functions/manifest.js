exports.handler = async function (event, context) {
  const response = {
    event, context
  }
  return {
    statusCode: 200,
    body: JSON.stringify(response)
  }
}
