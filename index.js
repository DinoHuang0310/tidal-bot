'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const getJSON = require('get-json');
const moment = require('moment');
const { GET_TIDAL_BY_DATE } = require('./api');
const tidalhandler = require('./handler/tidalhandler');
// const dbhandler = require('./server/dbhandler');

console.log(typeof(tidalhandler))

// create LINE SDK client
const client = new line.Client({
    channelAccessToken: process.env.channelAccessToken,
    channelSecret: process.env.channelSecret
});

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
    if (event.type !== 'message' || event.message.type !== 'text') {
        // ignore non-text-message event
        return Promise.resolve(null);
    }

    // 語句檢查
    const userInputStr = event.message.text.replace(/\s+/g, ""); // 去空白
    const tidalRegex = /^[^a-zA-Z0-9]{2,}潮汐/; // 開頭非英文或數字,接潮汐

}

// getTidalData
function getTidalData() {
    const fromDate = moment().format('YYYY-MM-DD');
    const toDate = moment().add(3, 'days').format('YYYY-MM-DD');
    getJSON(GET_TIDAL_BY_DATE(fromDate, toDate), function(error, response) {
        let arr = [];
        response.records.location.forEach(element => {
            arr.push(element);
        });
        tidalData = arr;
        console.log('getTidalData OK');
    });
}

// listen on port
var server = app.listen(process.env.PORT || 8080, function() {
    var port = server.address().port;
    console.log("App now running on port", port);
});