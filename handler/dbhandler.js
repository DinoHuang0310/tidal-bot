const pg = require('pg');

const config = {
    host: process.env.Host,
    user: process.env.User,
    password: process.env.Password,
    database: process.env.Database,
    port: process.env.Port,
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
    }
}