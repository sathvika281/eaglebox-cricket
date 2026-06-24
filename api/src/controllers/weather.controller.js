const WeatherService = require('../services/weather.service');

const getCurrent = async (req, res, next) => {
  try {
    const weather = await WeatherService.getCurrentWeather();
    if (!weather) return res.json({ success: true, data: null, message: 'Weather service not configured' });
    res.json({ success: true, data: weather });
  } catch (err) { next(err); }
};

const getForecast = async (req, res, next) => {
  try {
    const forecast = await WeatherService.getForecast();
    res.json({ success: true, data: { forecast } });
  } catch (err) { next(err); }
};

module.exports = { getCurrent, getForecast };
