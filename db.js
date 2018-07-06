var mysql = require('mysql');
//[START FOR CONFIGUARTION FILES]
var config = require('./config');
var options = {
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
};
//[END FOR CONFIGURATION FILES]
//[CONNECTION TO CLOUD SQL DATABASE]
var connection = mysql.createConnection(options);
module.exports = connection;
//# sourceMappingURL=db.js.map