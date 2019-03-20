const {Wechaty, Message, Contact} = require('wechaty')

/**
 * 覆盖原有的mention方法。at分隔符手机版本为\u2005，电脑版为\u0020
 */
Message.prototype.mention = async function () {

  const room = this.room()
  if (this.type() !== Message.Type.Text || !room) {
    return []
  }

  // define magic code `8197` to identify @xxx
  // const AT_SEPRATOR = String.fromCharCode(8197)
  const AT_SEPRATOR = /[\u2005\u0020]/

  const atList = this.text().split(AT_SEPRATOR)
  // console.log('atList: ', atList)
  if (atList.length === 0) return []

  // Using `filter(e => e.indexOf('@') > -1)` to filter the string without `@`
  const rawMentionList = atList
    .filter(str => str.includes('@'))
    .map(str => multipleAt(str))

  // convert 'hello@a@b@c' to [ 'c', 'b@c', 'a@b@c' ]
  function multipleAt(str) {
    str = str.replace(/^.*?@/, '@')
    let name = ''
    const nameList = []
    str.split('@')
      .filter(mentionName => !!mentionName)
      .reverse()
      .forEach(mentionName => {
        // console.log('mentionName: ', mentionName)
        name = mentionName + '@' + name
        nameList.push(name.slice(0, -1)) // get rid of the `@` at beginning
      })
    return nameList
  }

  let mentionNameList = []
  // Flatten Array
  // see http://stackoverflow.com/a/10865042/1123955
  mentionNameList = mentionNameList.concat.apply([], rawMentionList)
  // filter blank string
  mentionNameList = mentionNameList.filter(s => !!s)

  // log.verbose('Message', 'mention() text = "%s", mentionNameList = "%s"',
  //   this.text(),
  //   JSON.stringify(mentionNameList),
  // )

  const contactListNested = await Promise.all(
    mentionNameList.map(
      name => room.memberAll(name),
    ),
  )

  let contactList = []
  contactList = contactList.concat.apply([], contactListNested)

  // if (contactList.length === 0) {
  //   log.silly('Message', `message.mention() can not found member using room.member() from mentionList, metion string: ${JSON.stringify(mentionNameList)}`)
  // }
  return contactList
}