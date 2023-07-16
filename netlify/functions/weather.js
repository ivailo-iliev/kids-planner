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

  const airtableApi = "https://api.airtable.com/v0/appCu46edF9GYofCL/current-weather/";
  const weatherData = await (await fetch(airtableApi, requestOptions)).json();
  const todayForecastData = JSON.parse(weatherData.records[0].fields.Value);
  const currentWeatherData = JSON.parse(weatherData.records[1].fields.Value);

  return {
    statusCode: 200,
    body: JSON.stringify({
      todayForecastData,
      currentWeatherData
    })
  }
}