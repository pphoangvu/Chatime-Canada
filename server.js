const express = require('express');
const mysql = require('mysql');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var exphbs = require('express-handlebars');

// First you need to create a connection to the database
// Be sure to replace 'user' and 'password' with the correct values
const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'Chatime'
});


con.connect((err) => {
    if(err){
        throw err;
    }
    console.log('MySql Connected...');
});
const app = express();

app.get('/createdb', (req, res) => {
    let sql = 'CREATE DATABASE nodemysql';
    con.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Database created...');
    });
});

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.engine('.hbs',exphbs({
    extname:'.hbs', 
    defaultLayout:'main',
    helpers:{
        navLink:function(url, options){
            return '<li' + ((url==app.locals.activeRoute)? ' class="active"':'')
                +'><a href="'+url+'">'+options.fn(this)+'</a></li>'
        },
        equal:function(lvalue, rvalue, options){
            if(arguments.length<3)
                throw new Error("Handlerbars Helper equal needs 2 parameters");
            if(lvalue != rvalue){
                return options.inverse(this);
            }else{
                return options.fn(this);
            }
        }
    }
}));

app.set('view engine','.hbs');
app.use(function(req,res,next){
    let route=req.baseUrl + req.path;
    app.locals.activeRoute = (route=="/")? "/":route.replace(/\/$/,"");
    next();
});


app.get('/', function(request, response) {
    response.render("home");
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/login', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		con.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});

app.get('/getEmployees', (req, res) => {
    let sql = 'SELECT * FROM Employee';
    if (req.session.loggedin) {
        let query = con.query(sql, (err, results) => {
            if(err) throw err;
            console.log(results);
            res.send('Employee fetched...');
    
        });
    } else {res.send('Please login to view this page!');}
    
    res.end();

});

app.get('/getEmployee/:id', (req, res) => {
    console.log(req.params.id);
    let sql = 'SELECT * FROM Employee WHERE emp_id = ' + req.params.id;
    let query = con.query(sql , (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Employee fetched...');
    });

});

app.get('/updateEmployee/:id', (req, res) => {
    let sql = `UPDATE Employee SET status = 1 WHERE emp_id = ${req.params.id}`;
    let query = con.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Employee updated...');
    });
});

app.get('/deleteEmployee/:id', (req, res) => {
    let sql = `DELETE FROM Employee WHERE emp_id = ${req.params.id}`;
    let query = con.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Employee deleted...');
    });
});





app.listen('3000', () => {
    console.log('Server started on port 3000');
});
