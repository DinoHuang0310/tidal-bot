// 引用 line bot SDK
let linebot = require('linebot');

// 初始化 line bot 需要的資訊，在 Heroku 上的設定的 Config Vars，可參考 Step2
let bot = linebot({
    channelId: '1654690588',
    channelSecret: 'c3fb1a023f2f0e297ea3c8fceb3d5cd3',
    channelAccessToken: '4SvaWSSOxYOYa9FyYtF6pTc3uOiBY0QbGSnCLEu6kQ28AJ5287n8groLeOga1GIbDOgJ4sN/Z+zboVcliVEohxMHFhXJUUeRDBdnBDKUgBZswuPIv9Q+8jhj3TBsVHl6iSPtV6YMHcEXF0Ad2xcyXgdB04t89/1O/w1cDnyilFU='
});

// 當有人傳送訊息給 Bot 時
bot.on('message', function(event) {
    // 回覆訊息給使用者 (一問一答所以是回覆不是推送)
    event.reply(`你說了 ${event.message.text}`);
});

// Bot 所監聽的 webhook 路徑與 port，heroku 會動態存取 port 所以不能用固定的 port，沒有的話用預設的 port 5000
bot.listen('/', process.env.PORT || 5000, function() {
    console.log('全國首家LINE線上機器人上線啦！！');
});