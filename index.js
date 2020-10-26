'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const getJSON = require('get-json');
const moment = require('moment');
// const { GET_TIDAL_BY_DATE } = require('./api');
// const { channelAccessToken, channelSecret, port } = require('./config');
// const tidalHandler = require('./handler/tidalHandler');
const dbhandler = require('./server/dbhandler');

console.log(typeof(dbhandler))
const lineConfig = {
        channelAccessToken: process.env.channelAccessToken,
        channelSecret: process.env.channelSecret
    }
    // create LINE SDK client
const client = new line.Client(lineConfig);

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
    return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '4545454'
    });
}

// listen on port
var server = app.listen(process.env.PORT || 8080, function() {
    var port = server.address().port;
    console.log("App now running on port", port);
});