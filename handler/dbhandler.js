const { getTargetData, createOption } = require('./tidalhandler');
const pg = require('pg');
const config = {
    host: process.env.Host || require('../config').Host,
    user: process.env.User || require('../config').User,
    password: process.env.Password || require('../config').Password,
    database: process.env.Database || require('../config').Database,
    port: process.env.Port || require('../config').Port,
    ssl: { rejectUnauthorized: false }
};
const tableName = process.env.tableName || require('../config').tableName;
// 建立連線池
const pool = new pg.Pool(config);

module.exports = {
    // admin only
    insertData: function() {
        pool.connect((err, client, done) => {
            if (err) throw err;
            const query = `INSERT INTO ${tableName} VALUES ('U37f55304d976ca8929e32d2db4265525',ARRAY [ '淡水','桃園' ]);`;
            // 新增欄位
            // ALTER TABLE ${tableName} ADD COLUMN keywords TEXT [];
            client.query(query, (err, res) => {
                if (err) {
                    console.log(err.stack);
                    done();
                } else {
                    console.log('insert OK!');
                    done();
                }
            })
        })
    },
    // admin only
    readAllData: function(callback) {
        pool.connect((err, client, done) => {
            if (err) throw err;
            const query = `SELECT * FROM ${tableName};`;
            client.query(query, (err, res) => {
                if (err) {
                    console.log(err.stack);
                    done();
                } else {
                    callback(res.rows);
                    done();
                }
            })
        })
    },

    // admin only
    resetTable: function(callback) {
        pool.connect((err, client, done) => {
            if (err) throw err;
            const query = `TRUNCATE TABLE ${tableName};`;
            client.query(query, (err, res) => {
                if (err) {
                    console.log(err.stack);
                    done();
                } else {
                    callback({
                        type: 'text',
                        text: '清空table'
                    });
                    done();
                }
            })
        })
    },

    setKeyword: async function(id, addLocation, callback) {
        const userData = await module.exports.getUserDataById(id);
        if (userData.length < 5) {
            // userData.length=0 為新用戶
            const query = userData.length === 0 ?
                `INSERT INTO ${tableName} VALUES ('${id}',ARRAY [ '${addLocation} ]);` :
                `UPDATE ${tableName} SET keywords = keywords || '{${addLocation}}' WHERE id = '${id}';`;
            // 先檢查重複
            const check = userData.filter(item => {
                return item === addLocation;
            });
            if (check.length > 0) {
                callback({
                    type: 'text',
                    text: '此地點已經存在~'
                })
            } else {
                pool.connect((err, client, done) => {
                    if (err) throw err;
                    client.query(query, (err, res) => {
                        if (err) {
                            console.log(err.stack);
                            done();
                        } else {
                            callback({
                                type: 'text',
                                text: '新增成功!'
                            })
                            done();
                        }
                    })
                })
            }
        } else {
            callback({
                type: 'text',
                text: '儲存地點超過5筆, 請先刪除地點再新增'
            })
        }
    },

    getUserDataById: async function(id) {
        return (async() => {
            const client = await pool.connect();
            try {
                const query = `SELECT keywords FROM ${tableName} WHERE id = '${id}';`;
                const res = await client.query(query);
                // 有該使用者 返回資料 否則返回空陣列
                return res.rows.length ? res.rows[0].keywords : [];
            } finally {
                client.release();
            }
        })().catch(err => console.log(err.stack));
    },

    setFavorite: function(id, location, tidalData, callback) {
        const target = getTargetData(tidalData, location);
        if (target.length === 1) {
            // 設定
            module.exports.setKeyword(id, target[0].locationName, callback);
        } else if (target.length < 1) {
            // 該關鍵字查無資料
            callback({
                type: 'text',
                text: '你的地點查無資料哦哦哦~~~~'
            });
        } else if (target.length < 6) {
            // 查詢結果2~5筆 產出選項
            callback({
                type: "flex",
                altText: "你484要新增:",
                contents: {
                    type: "bubble",
                    body: {
                        type: "box",
                        layout: "vertical",
                        contents: [{
                            type: "text",
                            text: "你484要新增:",
                        }]
                    },
                    footer: {
                        type: "box",
                        layout: "vertical",
                        contents: createOption(target, { type: 'addFavorite', user: id })
                    },
                    styles: {
                        footer: {
                            separator: true
                        }
                    }
                }
            })
        } else {
            // 查詢結果過多
            callback({
                type: 'text',
                text: `你的地點查詢結果過多~~ 下精準一點 董?`
            });
        }
    },

    showMyList: async function(id, action, callback) {
        const userData = await module.exports.getUserDataById(id);
        setTitle = () => {
            switch (action) {
                case 'deleteFavorite':
                    return '請選擇要刪除的地點:';
                case 'search':
                    return '請選擇地點:';
            }
        }
        if (userData.length) {
            callback({
                type: "flex",
                altText: setTitle(),
                contents: {
                    type: "bubble",
                    body: {
                        type: "box",
                        layout: "vertical",
                        contents: [{
                            type: "text",
                            text: setTitle()
                        }]
                    },
                    footer: {
                        type: "box",
                        layout: "vertical",
                        contents: createOption(userData, { type: action, user: id })
                    },
                    styles: {
                        footer: {
                            separator: true
                        }
                    }
                }
            })
        } else {
            callback({
                type: 'text',
                text: '您尚未儲存常用地點~'
            })
        }
    },

    // todo 資料庫刪除地點
    deleteKeyword: async function(id, deleteLocation, callback) {
        const query = `UPDATE ${tableName} SET keywords = array_remove(keywords, '${deleteLocation}') WHERE id = '${id}'`;
        pool.connect((err, client, done) => {
            if (err) throw err;
            client.query(query, (err, res) => {
                if (err) {
                    console.log(err.stack);
                    done();
                } else {
                    callback({
                        type: 'text',
                        text: `刪除地點> ${deleteLocation} 成功`
                    })
                    done();
                }
            })
        })
    }

}