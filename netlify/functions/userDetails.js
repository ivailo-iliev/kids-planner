const fetch = require('node-fetch')

exports.handler = async function (event, context) {
  const UserId = event.queryStringParameters.id;
  console.log(UserId);
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Bearer patK67o9PJI2V7wJI.58ff50c61d33b346880bcd7eaf6bb93ad8882303b0c7a47387e731f5dee6cf5d");

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  const airtableApi = "https://api.airtable.com/v0/appCu46edF9GYofCL/week?filterByFormula=UserID%3D%22"+UserId+"%22&view=even";
  const fetchCalendar = await fetch(airtableApi, requestOptions);
  const calendarData = await fetchCalendar.json();

  return {
    statusCode: 200,
    body: JSON.stringify(calendarData)
  }
}