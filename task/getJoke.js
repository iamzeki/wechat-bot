const http = require("http");
const {JVHE_JOKE_HOST} = require('../config');

const GetJoke = () => {
  return new Promise(resolve => {
    let req = http.get(JVHE_JOKE_HOST);
    req.on("response", (res) => {
      let content = '';
      res.on("data", (data) => {
        content += data;
      });
      res.on('end', () => {
        try {
          content = JSON.parse(content);
          if (content.reason) {
            resolve(content.result[0].content)
          } else {
            resolve()
          }
        } catch (e) {
          resolve()
        }
      })
    });
  })
};

module.exports = GetJoke