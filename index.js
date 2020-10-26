var linebot = require('linebot');
var express = require('express');

var bot = linebot({
    channelId: '1654690588',
    channelSecret: 'c3fb1a023f2f0e297ea3c8fceb3d5cd3',
    channelAccessToken: '4SvaWSSOxYOYa9FyYtF6pTc3uOiBY0QbGSnCLEu6kQ28AJ5287n8groLeOga1GIbDOgJ4sN/Z+zboVcliVEohxMHFhXJUUeRDBdnBDKUgBZswuPIv9Q+8jhj3TBsVHl6iSPtV6YMHcEXF0Ad2xcyXgdB04t89/1O/w1cDnyilFU='
});

bot.on('message', function(event) {
    console.log(event); //把收到訊息的 event 印出來看看
});

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function() {
    var port = server.address().port;
    console.log("App now running on port", port);
});