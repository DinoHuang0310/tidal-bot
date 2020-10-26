'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const getJSON = require('get-json');
const moment = require('moment');
// const { GET_TIDAL_BY_DATE } = require('./api');
// const { channelAccessToken, channelSecret, port } = require('./config');
// const tidalHandler = require('./handler/tidalHandler');
const dbHandler = require('../server/dbHandler');

console.log(typeof(dbHandler))
const lineConfig = {
        channelAccessToken: '4SvaWSSOxYOYa9FyYtF6pTc3uOiBY0QbGSnCLEu6kQ28AJ5287n8groLeOga1GIbDOgJ4sN/Z+zboVcliVEohxMHFhXJUUeRDBdnBDKUgBZswuPIv9Q+8jhj3TBsVHl6iSPtV6YMHcEXF0Ad2xcyXgdB04t89/1O/w1cDnyilFU=',
        channelSecret: 'c3fb1a023f2f0e297ea3c8fceb3d5cd3'
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