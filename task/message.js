const GetWeather = require('./getWeather');
const GetJoke = require('./getJoke');

const message = async (msg, text = msg.text(), defaultReply = false) => {
  let reply = defaultReply ? '卧槽，这个不会...\n不过，你可以这样问我：\n揭阳市天气\n讲个笑话' : ''; // 默认回复
  // 你好
  if (text.includes('你好')) {
    reply = '你好'
  }
  // 天气
  if (text.includes('天气')) {
    const city = text.replace('天气', '');
    await msg.say(`正在查询 ${city} 的天气`);
    reply = await GetWeather(city) || `无法查询 ${city} 的天气`;
  }
  // 讲笑话
  if (text.includes('笑话')) {
    await msg.say('好的，让我想想...');
    reply = await GetJoke() || '呜呜呜，竟然想不到';
  }
  reply && await msg.say(reply)
};

module.exports = message;