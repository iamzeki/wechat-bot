/**
 * 采集天气城市信息
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const {MOJI_PROVINCE_HOST} = require('./config');

(async () => {
  // 启动浏览器
  const browser = await puppeteer.launch();
  console.log('浏览器启动中...');
  // 获取墨迹天气数据
  const pageCityList = await browser.newPage();
  await pageCityList.goto(MOJI_PROVINCE_HOST);
  console.log(`goto ${MOJI_PROVINCE_HOST}`);
  // 采集省份
  const cityList = await pageCityList.$('#city');
  let weatherDetail = await cityList.$$eval('.city_list li', (doms) => {
    return doms.map(dom => {
      return {
        city: dom.querySelector('a').innerHTML,
        href: dom.querySelector('a').getAttribute('href')
      }
    })
  });
  pageCityList.close();
  console.log('success');
  // 采集省份以下城市
  for (let i = 0, len = weatherDetail.length; i < len; i++) {
    const {href} = weatherDetail[i];
    const hrefA = `https://tianqi.moji.com${href}`;
    const cityPage = await browser.newPage();
    console.log(`goto ${hrefA}`);
    await cityPage.goto(hrefA)
    const cityListPage = await cityPage.$('.city_hot');
    weatherDetail[i].children = await cityListPage.$$eval('li', (lis) => {
      return lis.map(li => {
        return {
          city: li.querySelector('a').innerHTML,
          href: li.querySelector('a').getAttribute('href'),
        }
      })
    });
    cityPage.close();
    console.log('success');
  }
  console.log('all done');
  // 关闭浏览器
  await browser.close();
  // 创建json
  const content = JSON.stringify(weatherDetail);
  const fileName = 'weather-list';
  const filePath = path.join(__dirname, `data/${fileName}.json`);
  const filePathCopy = path.join(__dirname, `data/${fileName}_copy.json`);
  const isExists = await fs.existsSync(filePath);
  if (isExists) {
    // 已存在文件，进行备份
    try {
      await fs.writeFileSync(filePathCopy, await fs.readFileSync(filePath));
      console.log('备份文件创建成功，地址：' + filePathCopy);
    } catch (e) {
      console.error(e)
    }
  }
  try {
    await fs.writeFileSync(filePath, content);
    console.log('文件创建成功，地址：' + filePath);
  } catch (e) {
    console.error(e)
  }
})();