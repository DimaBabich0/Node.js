var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var connection = require('./js/config');
var mssql = require('mssql');
var port = 8080;

app.use(bodyParser.json());

// создание сессии 
app.use(cookieParser());
app.use(session({
  saveUninitialized: true,
  secret: 'supersecret'
}));

app.set('views', path.join(__dirname, 'pages'));
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/login', function (req, res) {
  var userData = {
    login: req.body.username,
    password: req.body.password
  };

  var checkUserLogin = new mssql.PreparedStatement(connection);

  checkUserLogin.input('login', mssql.VarChar);
  checkUserLogin.input('password', mssql.VarChar);

  var queryCheckType = `
    SELECT 'user' AS userType FROM Users WHERE login = @login AND password = @password
    UNION
    SELECT 'admin' AS userType FROM Admins WHERE login = @login AND password = @password
  `;

  checkUserLogin.prepare(queryCheckType, function (err) {
    if (err) {
      console.log(err);
      return res.send('Error preparing query');
    }

    checkUserLogin.execute(userData, function (err, result) {
      if (result.recordset.length > 0) {
        var userType = result.recordset[0].userType;
        req.session.username = userType;
        console.log("Login succeeded: ", req.session.username);
        res.send('Login successful: ' + 'sessionID: ' + req.session.id + '; user: ' + req.session.username);
      } else {
        console.log("Login failed: ", req.body.username)
        res.status(401).send('Login error');
      }
      checkUserLogin.unprepare();
    });
  });
});

app.get('/logout', function (req, res) {
  req.session.username = '';
  console.log('Logged out');
  res.send('Logged out');
});

app.get('/admin', function (req, res) {
  // страница доступна только для админа 
  if (req.session.username === 'admin') {
    console.log(req.session.username + ' requested admin page');
    res.render('admin_page');
  } else {
    res.status(403).send('Access Denied!');
  }
});

app.get('/user', function (req, res) {
  // страница доступна для любого залогиненного пользователя 
  if (req.session.username.length > 0) {
    console.log(req.session.username + ' requested user page');
    res.render('user_page');
  } else {
    res.status(403).send('Access Denied!');
  };
});

app.get('/guest', function (req, res) {
  // страница без ограничения доступа 
  res.render('guest_page');
});

app.listen(port, function () {
  console.log('app running on port ' + port);
})
