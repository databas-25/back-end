const mysql = require('mysql');
const fs = require('fs');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true,
});

pool.query(fs.readFileSync('./src/setup.sql').toString(), function(err, res, info) {
    if (err) {
        console.error(err.sqlMessage);
    }
});

// program loop....
// async function query(request, params) {
//     try {
//         conn.query(reques)
//     }
// }

module.exports = pool;
