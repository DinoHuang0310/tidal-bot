const pg = require('pg');

const config = {
    host: process.env.Host || require('../config').Host,
    user: process.env.User || require('../config').User,
    password: process.env.Password || require('../config').Password,
    database: process.env.Database || require('../config').Database,
    port: process.env.Port || require('../config').Port,
    ssl: { rejectUnauthorized: false }
};

module.exports = () => {
    const client = new pg.Client(config);
    client.connect(err => {
        if (err) throw err;
        else {
            queryDatabase();
        }
    });

    function queryDatabase() {
        console.log('連線成功!')
        client.end(console.log('Closed client connection'));
    }
}