const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const currentWeatherApi = "https://dataservice.accuweather.com/currentconditions/v1/51097?apikey=8GM4gMnnGKurUdAFMBNrFobGX1XnG1kG&language=bg-bg&details=true";
    
  const fetchCurrentWeather = await fetch(currentWeatherApi)
  const currentWeatherData = await fetchCurrentWeather.json()

  const todayForecastApi = "https://dataservice.accuweather.com/forecasts/v1/daily/1day/51097?apikey=8GM4gMnnGKurUdAFMBNrFobGX1XnG1kG&language=bg-bg&details=true&metric=true";
    
  const fetchTodayForecast = await fetch(todayForecastApi);
  const todayForecastData = await fetchTodayForecast.json();

  const weatherDataCache =
  {
    "records": [
      {
        "id": "recLxkU2dyt16sIwf",
        "fields": {
          "Name": "todaysForecast",
          "Value": JSON.stringify(todayForecastData)
        }
      },
      {
        "id": "recUF1J84zlIwn0Y8",
        "fields": {
          "Name": "currentWeather",
          "Value": JSON.stringify(currentWeatherData)
        }
      }
    ]
  };

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Bearer patK67o9PJI2V7wJI.58ff50c61d33b346880bcd7eaf6bb93ad8882303b0c7a47387e731f5dee6cf5d");
  myHeaders.append("Content-Type", "application/json");
  var requestOptions = {
    method: 'PATCH',
    headers: myHeaders,
    redirect: 'follow',
    body: JSON.stringify(weatherDataCache)
  };
  const airtableApi = "https://api.airtable.com/v0/appCu46edF9GYofCL/current-weather";
  const updateWeather = await fetch(airtableApi, requestOptions);
  const updateResponse = await updateWeather.json();
  console.log(updateResponse);
  return {
    statusCode: 200,
    body: JSON.stringify(updateResponse)
  }
}