const express = require('express');
const connection = require('./database');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use('/assets', express.static('assets'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/auth.html');
});

app.get('/addnew_parcel.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'addnew_parcel.html'));
});
app.get('/addnew_branch', (req, res) => {
    res.render('addnew_branch');
});
app.get('/list_branches', (req, res) => {
    res.render('list_branches');
});
app.get('/addnew_branchstaff', (req, res) => {
    res.render('addnew_branchstaff');
});
app.get('/list_branchstaff', (req, res) => {
    res.render('list_branchstaff');
});
app.get('/list_parcels', (req, res) => {
    res.render('list_parcels');
});
app.get('/items_accepted', (req, res) => {
    res.render('items_accepted');
});
app.get('/list_collected', (req, res) => {
    res.render('list_collected');
});
app.get('/list_shipped', (req, res) => {
    res.render('list_shipped');
});
app.get('/list_intransit', (req, res) => {
    res.render('list_intransit');
});
app.get('/list_arrived', (req, res) => {
    res.render('list_arrived');
});
app.get('/list_outfordeliver', (req, res) => {
    res.render('list_outfordeliver');
});
app.get('/list_delivered', (req, res) => {
    res.render('list_delivered');
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
    connection.query('SELECT (SELECT COUNT(*) FROM branch) AS branchCount, (SELECT COUNT(*) FROM staff) AS staffCount', function (error, results) {
        if (error) {
            console.error('Error querying the database: ' + error);
            res.status(500).send('Internal Server Error');
            return;
        }
        const branchCount = results[0].branchCount;
        const staffCount = results[0].staffCount;

        res.render('home', { branchCount, staffCount });
    });
});

app.post('/addnew_branch', (req, res) => {
    const { branchAddr, branchCity, branchPhone } = req.body;
    const sql = 'INSERT INTO branch (branch_addr, branch_city, branch_phone) VALUES (?, ?, ?)';
    const values = [branchAddr, branchCity, branchPhone];

    connection.query(sql, values, (error) => {
        if (error) {
            console.error('Error inserting data into the database: ' + error);
            res.status(500).send('Internal Server Error');
            return;
        }
        const successMessage = 'Successfully added a new Branch';
        res.render('home', { successMessage });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
