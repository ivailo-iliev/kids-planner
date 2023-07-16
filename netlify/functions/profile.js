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

  return {
    statusCode: 200,
    body: JSON.stringify(profileData)
  }
}