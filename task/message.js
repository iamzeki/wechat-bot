const GetWeather = require('./getWeather');

const message = async (msg, text = msg.text(), defaultRe = false) => {
  let reply = defaultRe ? '卧槽，这个不会...' : '';
  if (text.includes('你好')) {
    reply = '你好'
  }
  if (text.includes('天气')) {
    const city = text.replace('天气', '');
    await msg.say(`正在查询 ${city} 的天气`);
    reply = await GetWeather(city) || `无法查询 ${city} 的天气`;
  }
  reply && await msg.say(reply)
};

module.exports = message;