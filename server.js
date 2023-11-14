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
            res.status(500).send('Internal Server Error');
        } else {
            // Log the activity
            const activitySql = 'INSERT INTO activity_log (activity_type, details) VALUES (?, ?)';
            const activityValues = ['New Branch Added', `New branch added: ${branchAddr}, ${branchCity}, ${branchPhone}`];

            connection.query(activitySql, activityValues, (activityErr) => {
                if (activityErr) {
                    console.error('Error logging activity: ' + activityErr);
                }

                res.redirect('/home');
            });
        }
    });
});

app.get('/list_branches', (req, res) => {
    const query = 'SELECT * FROM branch';

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error querying the database: ' + error);
            res.status(500).send('Internal Server Error');
        } else {
            res.render('list_branches', { branchData: results });
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
                // Log the activity
                const activitySql = 'INSERT INTO activity_log (activity_type, details) VALUES (?, ?)';
                const activityValues = ['Staff Hired', `New staff member ${empName} added to branch ${empBranch}`];

                connection.query(activitySql, activityValues, (activityErr) => {
                    if (activityErr) {
                        console.error('Error logging activity: ' + activityErr);
                    }
                });

                res.redirect('/home');
            }
        });
    });
});


app.get('/list_branchstaff', (req, res) => {
    const query = `
    SELECT staff.emp_id, staff.emp_name, staff.emp_phone, staff.emp_branch_id, branch.branch_addr
    FROM staff
    INNER JOIN branch ON staff.emp_branch_id = branch.branch_id`;

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error querying the database: ' + error);
            res.status(500).send('Internal Server Error');
        } else {
            res.render('list_branchstaff', { staffData: results });
        }
    });
});

app.get('/list_parcels', (req, res) => {
    const query = `
        SELECT
            p.parcel_id,
            pd.type,
            p.cost,
            s.sender_name AS sender_name,
            r.recv_name AS receiver_name,
            p.date_accepted,
            p.status
        FROM
            parcels AS p
        INNER JOIN
            parcels_details AS pd ON p.cost = pd.cost
        INNER JOIN
            sender AS s ON p.sender_id = s.sender_id
        INNER JOIN
            receiver AS r ON p.recv_name = r.recv_name;`;

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error querying the database: ' + error);
            res.status(500).send('Internal Server Error');
        } else {
            res.render('list_parcels', { parcelData: results, alertMessage: null });
        }
    });
});

app.post('/updateParcelStatus/:parcelId', (req, res) => {
    const parcelId = req.params.parcelId;

    connection.query('CALL UpdateParcelStatus(?)', [parcelId], (error) => {
        if (error) {
            console.error('Error updating parcel status:', error);
            return res.status(500).json({ success: false });
        }

        const activitySql = 'INSERT INTO activity_log (activity_type, details) VALUES (?, ?)';
        const activityValues = ['Parcel Status Updated', `Parcel status updated for ID: ${parcelId}`];

        connection.query(activitySql, activityValues, (activityErr) => {
            if (activityErr) {
                console.error('Error logging activity: ' + activityErr);
            }

            return res.status(200).json({ success: true });
        });
    });
});

app.get('/getParcelDetails/:parcelId', (req, res) => {
    const parcelId = req.params.parcelId;

    const query = 'SELECT * FROM parcels_details WHERE parcel_id = ?';

    connection.query(query, [parcelId], (error, results) => {
        if (error) {
            console.error('Error querying the database: ' + error);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(results[0]);
        }
    });
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

        const query = `SELECT * FROM customer_parcel_view WHERE parcel_id = ?`;

        connection.query(query, [trackingID], (error, results) => {
            if (error) {
                console.error('Error querying the database: ' + error);
                res.status(500).send('Internal Server Error');
            } else if (results.length > 0) {
                res.render('customer_home', { parcelsData: results });
            } else {
                res.send('<script>alert("Parcel not found, please check the tracking ID."); window.location = "/";</script>');
            }
        });
    }
});

app.get('/home', function (req, res) {
    connection.query('SELECT * FROM count_table', function (error, results) {
        if (error) {
            console.error('Error querying the database: ' + error);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Fetch recent activities
        connection.query('SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT 3', function (activityError, activityResults) {
            if (activityError) {
                console.error('Error querying activity log: ' + activityError);
                res.status(500).send('Internal Server Error');
                return;
            }

            const counts = {};
            results.forEach(row => {
                counts[row.entity_name.toLowerCase()] = row.count_value;
            });

            const recentActivities = activityResults;

            res.render('home', { counts, recentActivities });
        });
    });
});

app.post('/addnew_parcel', async (req, res) => {
    try {
        const formData = req.body;

        // Step 2: Insert data into the sender table
        const insertSenderQuery = `INSERT INTO sender (sender_name, sender_addr) VALUES (?, ?)`;
        const senderValues = [formData.senderName, formData.senderAddress];

        connection.query(insertSenderQuery, senderValues, (err, senderResult) => {
            if (err) {
                console.error(err);
                res.status(500).send('An error occurred while adding the parcel after adding sender details.');
                return;
            }

            // Insert data into receiver table 
            const insertRecvQuery = `INSERT INTO receiver (recv_name, recv_addr) VALUES (?, ?)`;
            const recvValues = [formData.receiverName, formData.receiverAddress];

            connection.query(insertRecvQuery, recvValues, (err, receiverResult) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('An error occurred while adding the parcel after adding receiver details.');
                    return;
                }

                // Fetch sender_id from the sender table
                const senderId = senderResult.insertId;
                const recvName = formData.receiverName;
                const recvAddr = formData.receiverAddress;

                const insertSendsQuery = `INSERT INTO sends (sender_id, recv_name, recv_addr) VALUES (?, ?, ?)`;
                const sendsValues = [senderId, recvName, recvAddr];

                connection.query(insertSendsQuery, sendsValues, (err) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('An error occurred while adding the parcel after adding sender and receiver details to sends.');
                        return;
                    }

                    // Fetch emp_id from the staff table
                    const getEmployeeIdsQuery = 'SELECT emp_id FROM staff';
                    connection.query(getEmployeeIdsQuery, (err, employeeIds) => {
                        if (err) {
                            console.error(err);
                            res.status(500).send('An error occurred while adding the selecting random id from emp.');
                            return;
                        }

                        // Select a random emp_id from the list of available emp_id values
                        const randomEmpId = employeeIds[Math.floor(Math.random() * employeeIds.length)].emp_id;

                        // Insert data into the parcels table with date, status, and emp_id
                        const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
                        const statusOptions = ['accepted', 'shipped', 'intransit', 'out for delivery', 'delivered'];

                        const insertParcelsQuery = `
                            INSERT INTO parcels (cost, sender_id, recv_name, recv_addr, date_accepted, status, emp_id)
                            VALUES (?, ?, ?, ?, ?, ?, ?)`;

                        const parcelsValues = [
                            formData.parcelCost,
                            senderId,
                            formData.receiverName,
                            formData.receiverAddress,
                            currentDate,
                            statusOptions[Math.floor(Math.random() * statusOptions.length)],
                            randomEmpId
                        ];

                        connection.query(insertParcelsQuery, parcelsValues, (err, parcelsResult) => {
                            if (err) {
                                console.error(err);
                                res.status(500).send('An error occurred while adding the parcel in parcels table.');
                                return;
                            }

                            // Fetch parcel_id from the inserted parcel
                            const parcelId = parcelsResult.insertId;

                            // Insert data into the parcels_details table using the retrieved parcel_id
                            const insertParcelsDetailsQuery = `
                                INSERT INTO parcels_details (parcel_id, cost, weight, length, width, type, height)
                                VALUES (?, ?, ?, ?, ?, ?, ?)`;

                            const parcelsDetailsValues = [
                                parcelId,
                                formData.parcelCost,
                                formData.parcelWeight,
                                formData.parcelLength,
                                formData.parcelWidth,
                                formData.parcelType,
                                formData.parcelHeight
                            ];

                            connection.query(insertParcelsDetailsQuery, parcelsDetailsValues, (err, parcelsDetailsResult) => {
                                if (err) {
                                    console.error(err);
                                    res.status(500).send('An error occurred while adding details to the parcels_details table.');
                                    return;
                                }

                                // Log the activity
                                const activitySql = 'INSERT INTO activity_log (activity_type, details) VALUES (?, ?)';
                                const activityValues = ['New Parcel Added', `New parcel added with ID: ${parcelsResult.insertId}`];

                                connection.query(activitySql, activityValues, (activityErr) => {
                                    if (activityErr) {
                                        console.error('Error logging activity: ' + activityErr);
                                    }

                                    res.redirect('/home');
                                });
                            });
                        });
                    });
                });
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while adding the parcel.');
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
