const fetch = require('node-fetch')

const getWeekNumber = (date) => {
  var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  var dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
};

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

  const weekNum = getWeekNumber(new Date());
  const weekParity = weekNum % 2 === 0 ? "even" : "odd";

  const airtableApi = `https://api.airtable.com/v0/appCu46edF9GYofCL/week?filterByFormula=UserID%3D%22${userId}%22&view=${weekParity}`;
  const response = await fetch(airtableApi, requestOptions);
  const calendarData = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify(calendarData)
  }
}