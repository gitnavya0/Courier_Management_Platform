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

app.get('/addnew_branch', (req, res) => {
    res.render('addnew_branch');
});

app.post('/addnew_branch', (req, res) => {
    const { branchAddr, branchCity, branchPhone } = req.body;

    const sql = 'INSERT INTO branch (branch_addr, branch_city, branch_phone) VALUES (?, ?, ?)';
    const values = [branchAddr, branchCity, branchPhone];

    connection.query(sql, values, (err) => {
        if (err) {
            console.error('Error inserting data into the database: ' + err);
        } else {
            connection.query('SELECT (SELECT COUNT(*) FROM branch) AS branchCount, (SELECT COUNT(*) FROM staff) AS staffCount,(SELECT COUNT(*) FROM parcels) AS parcelCount', function (error, results) {
                if (error) {
                    console.error('Error querying the database: ' + error);
                    res.status(500).send('Internal Server Error');
                } else {
                    const branchCount = results[0].branchCount;
                    const staffCount = results[0].staffCount;
                    const parcelCount = results[0].parcelCount;
                    res.render('home', { branchCount, staffCount, parcelCount });
                }
            });
        }
    });
});

app.get('/list_branches', (req, res) => {
    res.render('list_branches');
});
app.get('/list_branches', (req, res) => {
    connection.query('SELECT * FROM branch', (err, rows) => {
        if (err) {
            console.error('Error querying the database: ' + err);
            res.status(500).send('Internal Server Error');
            return;
        }
        else {
            res.render('list_branches', { branchData: rows });
        }
    });
});

app.get('/addnew_parcel', (req, res) => {
    res.render('addnew_parcel');
});

app.get('/addnew_branchstaff', (req, res) => {
    res.render('addnew_branchstaff');
});
app.get('/getBranchAddresses', (req, res) => {
    connection.query('SELECT branch_addr FROM branch', (error, results) => {
        if (error) {
            console.error('Error querying the database: ' + error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const branchAddresses = results.map(result => result.branch_addr);
            res.json(branchAddresses);
        }
    });
});
app.post('/addnew_branchstaff', (req, res) => {
    const { empName, empPhone, empBranch } = req.body;

    connection.query('SELECT branch_id FROM branch WHERE branch_addr = ?', [empBranch], (err, results) => {
        if (err) {
            console.error('Error querying the database: ' + err);
            res.status(500).send('Internal Server Error');
            return;
        }

        const empBranchId = results[0] ? results[0].branch_id : null;

        const sql = 'INSERT INTO staff (emp_name, emp_phone, emp_branch_id) VALUES (?, ?, ?)';
        const values = [empName, empPhone, empBranchId];

        connection.query(sql, values, (err) => {
            if (err) {
                console.error('Error inserting data into the database: ' + err);
            } else {
                connection.query('SELECT (SELECT COUNT(*) FROM branch) AS branchCount, (SELECT COUNT(*) FROM staff) AS staffCount,(SELECT COUNT(*) FROM parcels) AS parcelCount', function (error, results) {
                    if (error) {
                        console.error('Error querying the database: ' + error);
                        res.status(500).send('Internal Server Error');
                    } else {
                        const branchCount = results[0].branchCount;
                        const staffCount = results[0].staffCount;
                        const parcelCount = results[0].parcelCount;
                        res.render('home', { branchCount, staffCount, parcelCount });
                    }
                });
            }
        });
    });
});

app.get('/list_branchstaff', (req, res) => {
    res.render('list_branchstaff');
});
app.get('/list_parcels', (req, res) => {
    res.render('list_parcels');
});

app.get('/customer_home', (req, res) => {
    res.render('customer_home');
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
        const trackingID = req.body.trackingID;

        const query = `SELECT * FROM parcels WHERE parcel_id = ?`;

        connection.query(query, [trackingID], (error, results) => {
            if (error) {
                console.error('Error querying the database: ' + error);
                res.status(500).send('Internal Server Error');
            } else if (results.length > 0) {
                res.redirect('/customer_home?trackingID=' + trackingID);
            } else {
                res.send('<script>alert("Parcel not found, please check the tracking ID."); window.location = "/";</script>');
            }
        });
    }
});

app.get('/home', function (req, res) {
    connection.query('SELECT (SELECT COUNT(*) FROM branch) AS branchCount, (SELECT COUNT(*) FROM staff) AS staffCount,(SELECT COUNT(*) FROM parcels) AS parcelCount', function (error, results) {
        if (error) {
            console.error('Error querying the database: ' + error);
            res.status(500).send('Internal Server Error');
            return;
        }
        const branchCount = results[0].branchCount;
        const staffCount = results[0].staffCount;
        const parcelCount = results[0].parcelCount;

        res.render('home', { branchCount, staffCount, parcelCount });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
