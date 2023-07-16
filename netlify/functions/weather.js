const fetch = require('node-fetch')

exports.handler = async function () {
  var airtableHeaders = {
    "Authorization": "Bearer patK67o9PJI2V7wJI.58ff50c61d33b346880bcd7eaf6bb93ad8882303b0c7a47387e731f5dee6cf5d"
  };
  
  var requestOptions = {
    method: 'GET',
    headers: airtableHeaders,
    redirect: 'follow'
  };

  const airtableApi1 = "https://api.airtable.com/v0/appCu46edF9GYofCL/current-weather/recLxkU2dyt16sIwf";
  const todayForecastData = JSON.parse((await (await fetch(airtableApi1, requestOptions)).json()).fields.Value);

  const airtableApi2 = "https://api.airtable.com/v0/appCu46edF9GYofCL/current-weather/recUF1J84zlIwn0Y8";
  const currentWeatherData = JSON.parse((await (await fetch(airtableApi2, requestOptions)).json()).fields.Value);

  return {
    statusCode: 200,
    body: JSON.stringify({
      todayForecastData,
      currentWeatherData
    })
  }
}