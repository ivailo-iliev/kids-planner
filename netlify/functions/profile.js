const fetch = require('node-fetch')

exports.handler = async function (event, context) {
  const userId = event.queryStringParameters.id;

  const airtableHeaders = {
    "Authorization": `Bearer ${process.env.AIRTABLE_TOKEN}`
  };

  const requestOptions = {
    method: 'GET',
    headers: airtableHeaders,
    redirect: 'follow'
  };

  const airtableApi = `https://api.airtable.com/v0/appCu46edF9GYofCL/users/${userId}`;
  const response = await fetch(airtableApi, requestOptions);
  const profileData = await response.json();

  const {
    "Language": currentLanguage,
    "Weather Location ID": weatherLocationId,
    "Display Name": displayName,
    "Sleep hour": sleepHour,
    "Wake up hour": wakeUpHour
  } = profileData.fields;

  const filteredData = {
    currentLanguage,
    weatherLocationId,
    displayName,
    sleepHour,
    wakeUpHour
  };


  return {
    statusCode: 200,
    body: JSON.stringify(filteredData)
  }
}