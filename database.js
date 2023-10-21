const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'homework',
    database: 'cms'
});
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
    }
    console.log('Connected to the database');
});
//to make sure connection has been established -> this works 
/*connection.query(`select * from manager_login_details`, (err, result, fields) => {
    if (err) {
        return console.log(err);
    }
    return console.log(result);
});*/

module.exports = connection;