const express = require('express');
const connection = require('./database');
const bodyParser = require('body-parser');
const ejs = require('ejs');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use('/assets', express.static('assets'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/auth.html');
});

app.post('/', function (req, res) {
    const role = req.body.selectedRole;
    if (role == 'Manager') {
        var username = req.body.username;
        var password = req.body.password;
        connection.query('select * from manager_login_details where username=? and password=?', [username, password], function (error, results, fields) {
            if (error) {
                console.error('Error querying the database: ' + error);
                res.status(500).send('Internal Server Error');
                return;
            }
            if (results.length > 0) {
                res.redirect('/home');
            } else {
                res.send('<script>alert("Incorrect username or password, Please try again!"); window.location = "/";</script>');
            }
        });
    } else if (role == 'Customer') {
        // Handle customer authentication here.
    }
});

app.get('/home', function (req, res) {
    connection.query('SELECT COUNT(*) AS branchCount FROM branch', function (error, results, fields) {
        if (error) {
            console.error('Error querying the database: ' + error);
            res.status(500).send('Internal Server Error');
            return;
        }
        const branchCount = results[0].branchCount;
        res.render('home', { branchCount });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
