const fetch = require('node-fetch')

exports.handler = async function () {
  const todayForecastApi = "https://dataservice.accuweather.com/forecasts/v1/daily/1day/51097?apikey=8GM4gMnnGKurUdAFMBNrFobGX1XnG1kG&language=bg-bg&details=true&metric=true";
    
  const fetchTodayForecast = await fetch(todayForecastApi)
  const todayForecastData = await fetchTodayForecast.json()

  return {
    statusCode: 200,
    body: JSON.stringify(todayForecastData)
  }
}