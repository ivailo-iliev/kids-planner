const fetch = require('node-fetch');

async function doRequest(apiUrl, method = 'GET', headers = {}, body = null) {
  const requestOptions = {
    method: method,
    headers: headers,
    redirect: 'follow',
    body: body ? JSON.stringify(body) : null
  };

  const response = await fetch(apiUrl, requestOptions);

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data;
}

exports.handler = async function (event, context) {
  const currentWeatherApi = `https://dataservice.accuweather.com/currentconditions/v1/51097?apikey=${process.env.ACCUWEATHER_API_KEY}&language=bg-bg&details=true`;
  const todayForecastApi = `https://dataservice.accuweather.com/forecasts/v1/daily/1day/51097?apikey=${process.env.ACCUWEATHER_API_KEY}&language=bg-bg&details=true&metric=true`;

  const forecastRequestHeaders = {
    "Accept-Encoding": "gzip,deflate"
  };

  let currentWeatherData, todayForecastData;
  try {
    [currentWeatherData, todayForecastData] = await Promise.all([
      doRequest(currentWeatherApi, 'GET', forecastRequestHeaders),
      doRequest(todayForecastApi, 'GET', forecastRequestHeaders)
    ]);
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
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
  }
  
  const airtableHeaders = {
    "Authorization": `Bearer ${process.env.AIRTABLE_TOKEN}`,
    "Content-Type": "application/json",
    "Accept-Encoding": "gzip, deflate"
  };

  const airtableApi = "https://api.airtable.com/v0/appCu46edF9GYofCL/current-weather";

  let updateResponse;
  try {
    updateResponse = await doRequest(airtableApi, 'PUT', airtableHeaders, weatherDataCache);
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updateResponse)
  }
}
