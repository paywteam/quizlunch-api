var mysql      = require('mysql');
const config = require('../configs/environments');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : config.mysql.username,
  password : config.mysql.password,
  database : config.mysql.database
});
exports.connect = function(callback){
    connection.connect(function(err) {
        if (err) {
            console.error('mysql connection error');
            console.error(err);
            throw err;
        }
        console.log("connected db")
        callback();
      });    
}
exports.connector = connection;
