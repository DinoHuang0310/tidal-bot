const MongoClient = require('mongodb').MongoClient;
const { url, dbName } = require('../config');

module.exports = {
    setKeyword: function(userId, location) {
        MongoClient.connect(url, function(err, client) {
            const db = client.db(dbName);
            const findDocuments = function(db, callback) {
                // Get the documents collection
                const collection = db.collection('linebot');
                // Insert some documents
                collection.find({ id: userId }).toArray(function(err, items) {
                    if (err) throw err;
                    if (items.length) {
                        // 資料庫已有該使用者資料
                        const userKeywords = items[0].keyword;
                        const usedKeyword = userKeywords.filter(item => {
                            return item.name === location
                        });
                        if (usedKeyword.length) {
                            // 有查過此關鍵字 > +1
                            collection.update({ id: userId, 'keyword.name': location }, { $inc: { 'keyword.$.frequency': 1 } }, { w: 1 },
                                function(err, result) {
                                    if (err) throw err;
                                    console.log(`${location} +1`);
                                }
                            );
                        } else {
                            // 未查過此關鍵字 > add
                            collection.update({ id: userId }, { $push: { keyword: { 'name': location, 'frequency': 1 } } }, { w: 1 },
                                function(err, result) {
                                    if (err) throw err;
                                    console.log(`add: ${location}`);
                                }
                            );
                        }
                    } else {
                        // add user
                        collection.insert({ id: userId, 'keyword': [{ 'name': location, 'frequency': 1 }] })
                    }
                });
            }
            findDocuments(db, function() {
                client.close();
            });
        });
    },
    queryKeyword: function(userId) {
        return MongoClient.connect(url).then(function(client) {
            const db = client.db(dbName);
            var collection = db.collection('linebot');

            return collection.find({ id: userId }).toArray();
        }).then(function(items) {
            if (items.length) {
                // 資料庫已有該使用者資料
                let userKeywords = items[0].keyword.sort((a, b) => {
                    return a.frequency < b.frequency ? 1 : -1;
                });
                if (userKeywords.length > 3) userKeywords.length = 3;
                console.log(userKeywords)
                return userKeywords;
            }
            return false;
        }).then(function() {
            client.close();
        });
    }
}