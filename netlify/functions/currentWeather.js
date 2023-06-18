const fetch = require('node-fetch')

exports.handler = async function () {
    const currentWeatherApi = "https://dataservice.accuweather.com/currentconditions/v1/51097?apikey=8GM4gMnnGKurUdAFMBNrFobGX1XnG1kG&language=bg-bg&details=true";
    
  const fetchCurrentWeather = await fetch(currentWeatherApi)
  const currentWeatherData = await fetchCurrentWeather.json()

  return {
    statusCode: 200,
    body: JSON.stringify(currentWeatherData)
  }
}