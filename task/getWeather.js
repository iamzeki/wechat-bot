const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const filePath = path.join(__dirname, '../data/weather-list.json');
const weatherList = JSON.parse(fs.readFileSync(filePath));

// 匹配城市
const _matchCity = (city) => {
  let result = [];
  const forEachChild = (children) => {
    children && children.forEach(item => {
      if (item.city.includes(city))
        result.push(item)
    })
  };
  for (let i = 0, len = weatherList.length; i < len; i++) {
    let {children, city: province} = weatherList[i];
    if (city.includes(province)) {
      // 匹配到带有省份信息
      const reg = new RegExp(province + "(省)?");
      city = city.replace(reg, ''); // 过滤省份
      forEachChild(children);
      break;
    }
    forEachChild(children)
  }
  /*return result.reduce((cur, item) => {
    const lastOne = cur.length - 1;
    if (cur[lastOne]) {
      // 保留字数少的
      if (item.city.length < cur[lastOne].city.length) {
        cur[lastOne] = item;
      } else {
        return cur
      }
    } else {
      cur.push(item)
    }
    return cur
  }, [])*/
  return result
};

// 采集今天天气
const _getTodayWeather = async (url) => {
  const browser = await puppeteer.launch();
  const weatherPage = await browser.newPage();
  await weatherPage.goto(url);
  const weaWeather = await weatherPage.$('.wea_weather');
  const temperature = await weaWeather.$eval('em', em => em.innerText); // 温度
  const weatherDesc = await weaWeather.$eval('b', b => b.innerText); // 天气描述
  const infoUptime = await weaWeather.$eval('strong', strong => strong.innerText); // 更新时间
  const weaAbout = await weatherPage.$('.wea_about');
  const humidity = await weaAbout.$eval('span', span => span.innerText); // 湿度
  const wind = await weaAbout.$eval('em', em => em.innerText); // 风向
  const weaTips = await weatherPage.$('.wea_tips');
  const tips = await weaTips.$eval('em', em => em.innerText); // 今日天气提示
  return `${temperature}° ${weatherDesc}\n${humidity} ${wind}\n${tips}\n${infoUptime}`;
};

module.exports = async (city) => {
  const result = _matchCity(city);
  switch (result.length) {
    case 0:
      return '';
    case 1:
      const item = result[0];
      const wea = await _getTodayWeather(item.href);
      return `${item.city}\n${wea}`;
    default:
      return '查找到多个结果，请精确到具体城市(区、县)\n' + result.map(({city}) => city).toString()
  }
};