const fetch = require('node-fetch')

exports.handler = async function () {
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Bearer patK67o9PJI2V7wJI.58ff50c61d33b346880bcd7eaf6bb93ad8882303b0c7a47387e731f5dee6cf5d");

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  const airtableApi = "https://api.airtable.com/v0/appCu46edF9GYofCL/current-weather/recLxkU2dyt16sIwf";
  const todayForecastData = JSON.parse((await (await fetch(airtableApi, requestOptions)).json()).fields.Value);

  return {
    statusCode: 200,
    body: JSON.stringify(todayForecastData)
  }
}