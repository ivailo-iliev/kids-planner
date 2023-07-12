const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const weatherData =
  {
    "records": [
      {
        "id": "recLxkU2dyt16sIwf",
        "fields": {
          "Name": "todaysForecast",
          "Value": "123"
        }
      },
      {
        "id": "recUF1J84zlIwn0Y8",
        "fields": {
          "Name": "currentWeather",
          "Value": "123"
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
    body: JSON.stringify(weatherData)
  };
  const airtableApi = "https://api.airtable.com/v0/appCu46edF9GYofCL/current-weather";

  const updateWeather = await fetch(airtableApi, requestOptions);
  console.log("executed");

  return {
    statusCode: 200
  }
}

//exports.handler = schedule("* * * ? * *", handler); //"0 0/30 6-21 ? * * *" every 30 minutes