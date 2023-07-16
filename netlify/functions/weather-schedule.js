const fetch = require('node-fetch');

async function fetchData(apiUrl, headers) {
  const response = await fetch(apiUrl, headers);
  if (!response.ok) {
    return { error: `API request failed with status ${response.status}` };
  }

  const data = await response.json();
  return data;
}

async function patchData(apiUrl, headers, body) {
  const requestOptions = {
    method: 'PATCH',
    headers: headers,
    redirect: 'follow',
    body: JSON.stringify(body)
  };

  const response = await fetch(apiUrl, requestOptions);
  const responseData = await response.json();
  return responseData;
}

exports.handler = async function (event, context) {
  const currentWeatherApi = "https://dataservice.accuweather.com/currentconditions/v1/51097?apikey=8GM4gMnnGKurUdAFMBNrFobGX1XnG1kG&language=bg-bg&details=true";
  const todayForecastApi = "https://dataservice.accuweather.com/forecasts/v1/daily/1day/51097?apikey=8GM4gMnnGKurUdAFMBNrFobGX1XnG1kG&language=bg-bg&details=true&metric=true";

  const forecastRequestHeaders = {
    headers: {
      "Accept-Encoding": "gzip,deflate"
    }
  };

  const currentWeatherData = await fetchData(currentWeatherApi, forecastRequestHeaders);
  if (currentWeatherData.error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: currentWeatherData.error })
    };
  }

  const todayForecastData = await fetchData(todayForecastApi, forecastRequestHeaders);
  if (todayForecastData.error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: todayForecastData.error })
    };
  }

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

  const airtableHeaders = {
    "Authorization": "Bearer patK67o9PJI2V7wJI.58ff50c61d33b346880bcd7eaf6bb93ad8882303b0c7a47387e731f5dee6cf5d",
    "Content-Type": "application/json"
  };

  const airtableApi = "https://api.airtable.com/v0/appCu46edF9GYofCL/current-weather";
  const updateResponse = await patchData(airtableApi, { headers: airtableHeaders }, weatherDataCache);

  return {
    statusCode: 200,
    body: JSON.stringify(updateResponse)
  }
}
