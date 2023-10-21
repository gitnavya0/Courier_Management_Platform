const express = require('express');
const connection = require('./database');
const bodyParser = require("body-parser");
const encoder = bodyParser.urlencoded();

const app = express();

app.use("/assets", express.static("assets"));

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/auth.html");
});

app.post("/", encoder, function (req, res) {
    const role = req.body.selectedRole;
    var username = req.body.username;
    var password = req.body.password;
    if (role == 'Manager') {
        connection.query(`select * from manager_login_details where username=? and password=?`, [username, password], function (error, results, fields) {
            if (results.length > 0) {
                res.redirect("/home");
            }
            else {
                res.redirect("/");
            }
        })
    }
    else if (role == 'Customer') {
        // Handle customer authentication here.
    }
});

app.get("/home", function (req, res) {
    res.sendFile(__dirname + "/home.html");
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
