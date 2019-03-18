const message = async (msg) => {
  const text = msg.text();
  let reply = '卧槽，这个不会...';
  if (/^你好$/i.test(text)) {
    reply = '你好'
  }
  await msg.say(reply)
};

module.exports = message;