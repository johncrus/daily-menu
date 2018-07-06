const mysql = require('mysql');
//[START FOR CONFIGUARTION FILES]
const config = require('./config');
const options = {
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
};
//[END FOR CONFIGURATION FILES]


//[CONNECTION TO CLOUD SQL DATABASE]
const connection = mysql.createConnection(options);

module.exports = connection;