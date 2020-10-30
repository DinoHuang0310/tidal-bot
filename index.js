'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const getJSON = require('get-json');
const moment = require('moment');
const { GET_TIDAL_BY_DATE } = require('./api');
const { getTidalByText, getTidalByPostback } = require('./handler/tidalhandler');
const { insertData, readAllData, getUserById, setKeyword } = require('./handler/dbhandler');
const admin = process.env.admin || require('./config').admin;

const lineConfig = {
    channelAccessToken: process.env.channelAccessToken || require('./config').channelAccessToken,
    channelSecret: process.env.channelSecret || require('./config').channelSecret
}
const client = new line.Client(lineConfig);

let tidalData = [];
getTidalData();

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/', line.middleware(lineConfig), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

// event handler
function handleEvent(event) {
    const isAdmin = event.source.userId === admin;
    if (event.type === 'message' && event.message.type === 'text') {
        // 處理文字訊息
        const userInputStr = event.message.text.replace(/\s+/g, ""); // 去空白
        const tidalRegex = /^[^a-zA-Z0-9]{2,}潮汐/; // 開頭非英文或數字,接潮汐
        if (event.message.text === '說明') {
            // 說明
            return client.replyMessage(event.replyToken, {
                type: 'text',
                text: `【查詢台灣各地潮汐】\n\n
                    查詢格式為:\n
                    【地點】+潮汐+【今天/明天/後天】\n
                    (時間不填則搜尋今天)\n\n
                    【範例如下】:\n
                    石門潮汐明天\n
                    三芝潮汐`
            });
        } else if (tidalRegex.test(userInputStr)) {
            // 問潮汐
            const echo = getTidalByText(event.source.userId, userInputStr, tidalData);
            return client.replyMessage(event.replyToken, echo);
        } else if (event.message.text === 'insert' && isAdmin) {
            insertData();
            return Promise.resolve(null);
        } else if (event.message.text === 'select' && isAdmin) {
            getUserById(event.source.userId);
            return Promise.resolve(null);
        } else if (event.message.text === 'set' && isAdmin) {
            setKeyword(event.source.userId, '石門');
            return Promise.resolve(null);
        } else if (event.message.text === 'read' && isAdmin) {
            readAllData(function(item) {
                let str = '';
                item.forEach((element, index) => {
                    str += `【${index + 1}】 ${element.id}\n${element.keywords}\n`
                });
                return client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: str
                });
            })
        } else {
            return client.replyMessage(event.replyToken, [{
                    type: 'text',
                    text: `公蝦咪挖溝 聽某喇`
                },
                {
                    type: 'text',
                    text: `請輸入:說明`
                }
            ]);
        }
    } else if (event.type === 'postback') {
        // 處理postback
        return client.replyMessage(event.replyToken,
            getTidalByPostback(event.source.userId, event.postback.data, tidalData));
    } else {
        // 其餘不處理
        return Promise.resolve(null);
    }



}

// getTidalData
const timeout = 25 * 60 * 1000;

function getTidalData() {
    const fromDate = moment().format('YYYY-MM-DD');
    const toDate = moment().add(3, 'days').format('YYYY-MM-DD');
    getJSON(GET_TIDAL_BY_DATE(fromDate, toDate), function(error, response) {
        let arr = [];
        response.records.location.forEach(element => {
            arr.push(element);
        });
        tidalData = arr;
        console.log(`getTidalData OK - ${moment().format('MMMM Do YYYY, h:mm a')}`);
    });
}

setInterval(function() { getTidalData() }, timeout);

// listen on port
var server = app.listen(process.env.PORT || 8080, function() {
    var port = server.address().port;
    console.log("哩公蝦毀的port ->", port);
});