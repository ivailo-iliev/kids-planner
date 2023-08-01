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

  // Check if profileData and profileData.fields are defined
  if (!profileData || !profileData.fields) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not fetch profile data' })
    };
  }

  const {
    "Language": currentLanguage,
    "Wake up time": wakeUpTimeSec,
    "Sleep time": sleepTimeSec,
    "Display Name": displayName,
    "Theme": theme,
    "☀️": iconSun,
    "🌙": iconMoon,
    "🍎": iconApple,
    "🛌": iconBed,
    "🥐": iconCroissant,
    "🍴": iconRestaurant
  } = profileData.fields;

  const filteredData = {
    currentLanguage,
    sleepTimeSec,
    wakeUpTimeSec,
    displayName,
    theme,
    iconApple,
    iconBed,
    iconCroissant,
    iconMoon,
    iconRestaurant,
    iconSun
  };

  return {
    statusCode: 200,
    body: JSON.stringify(filteredData)
  }
}
