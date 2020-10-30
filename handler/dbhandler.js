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
    insertData: function() {
        pool.connect((err, client, done) => {
            if (err) throw err;
            const query = `
                INSERT INTO ${tableName} VALUES (
                'newuser19880524',
                '石門'
                );
            `;
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

    readAllData: function(callback) {
        pool.connect((err, client, done) => {
            if (err) throw err;
            const query = `
                SELECT * FROM ${tableName};
            `;
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

    setKeyword: function(id, location) {
        pool.connect((err, client, done) => {
            if (err) throw err;
            const query = `
                SELECT keywords
                FROM ${tableName}
                WHERE id = '${id}';
            `;
            client.query(query, (err, res) => {
                if (err) {
                    console.log(err.stack);
                    done();
                } else {
                    console.log(res.rows[0])
                    const setQueryStr = `
                        UPDATE ${tableName}
                        SET keywords = '石門6'
                        WHERE id = '${id}';
                    `;
                    client.query(setQueryStr).then(res => {
                        done();
                        console.log('ok!!');
                    })
                }
            })
        })
    },

    getUserById: function(id, callback) {
        pool.connect((err, client, done) => {
            if (err) throw err;
            const query = `SELECT keywords FROM ${tableName} WHERE id = '${id}';`;
            client.query(query, (err, res) => {
                if (err) {
                    console.log(err.stack);
                    done();
                } else {
                    console.log(res.rows[0].keywords);
                    done();
                }
            })
        })
    }

}