const {Wechaty} = require('wechaty');
const TerminalCode = require('qrcode-terminal');
const Message = require('./message');

const StartBot = (name) => {
  //const puppet = 'wechaty-puppet-wechat4u';
  const bot = new Wechaty({
    name: name
  });
  bot.on('scan', (qrcode, status) => {
    console.log(`扫描二维码: ${status}\nhttps://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrcode)}&size=220x220&margin=20`)
    TerminalCode.generate(qrcode, {small: true});
  });
  bot.on('logout', user => {
    console.log(`用户 ${user.name()} 已登出`)
  });
  bot.on('login', user => {
    console.log(`用户 ${user.name()} 已登录`)
  });
  bot.on('message', async msg => {
    if (msg.self()) {
      // 忽略机器人发送的消息
      return
    }
    const contact = msg.from().name(); // 发送消息的联系人
    const text = msg.text(); // 消息内容
    const room = msg.room(); // 所在微信群
    if (room) {
      // 微信群消息
      const topic = await room.topic(); // 群名
      if (await msg.mentionSelf()) {
        // 在群里被@
        console.log('被@了');
        const filterText = text.match(/\s+(\S*)$/);
        if (filterText && filterText[1])
          await Message(msg, filterText[1], true)
      }
      console.log(`群消息：[${topic}] ${contact}：${text}`)
    } else {
      await Message(msg);
      console.log(`好友：${contact}：${text}`)
    }
  });
  bot.start() // 启动机器人
};

module.exports = StartBot;