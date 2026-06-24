const CITY = 'Hyderabad,IN';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const cache = new Map();

const _fetch = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  return res.json();
};

const getCurrentWeather = async () => {
  const key = 'current';
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return null;

  const raw = await _fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${apiKey}&units=metric`
  );

  const data = {
    city:        raw.name,
    temp:        Math.round(raw.main.temp),
    feels_like:  Math.round(raw.main.feels_like),
    condition:   raw.weather[0].main,
    description: raw.weather[0].description,
    humidity:    raw.main.humidity,
    wind_speed:  Math.round(raw.wind.speed * 3.6),
    icon:        raw.weather[0].icon,
    suitable_for_cricket: _isSuitable(raw),
    tip:         _getTip(raw),
  };

  cache.set(key, { data, ts: Date.now() });
  return data;
};

const getForecast = async () => {
  const key = 'forecast';
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return [];

  const raw = await _fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&appid=${apiKey}&units=metric&cnt=8`
  );

  const data = raw.list.map(item => ({
    time:      item.dt_txt,
    temp:      Math.round(item.main.temp),
    condition: item.weather[0].main,
    rain_prob: Math.round((item.pop || 0) * 100),
    humidity:  item.main.humidity,
    icon:      item.weather[0].icon,
  }));

  cache.set(key, { data, ts: Date.now() });
  return data;
};

function _isSuitable(raw) {
  const temp = raw.main.temp;
  const cond = raw.weather[0].main.toLowerCase();
  if (cond.includes('rain') || cond.includes('thunder') || cond.includes('storm')) return false;
  if (temp > 42 || temp < 10) return false;
  return true;
}

function _getTip(raw) {
  const temp = raw.main.temp;
  const cond = raw.weather[0].main.toLowerCase();
  if (cond.includes('rain') || cond.includes('thunder')) return 'Rain expected — consider indoor arrangements';
  if (temp > 40) return 'Very hot — carry extra water and play in shaded areas';
  if (temp > 35) return 'Hot conditions — schedule morning or evening slots';
  if (temp < 15) return 'Cool weather — great for intense play!';
  return 'Good conditions for cricket';
}

module.exports = { getCurrentWeather, getForecast };
