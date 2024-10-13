var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var connection = require('./js/config');
var mssql = require('mssql');
var port = 8080;

var queriesFaculties = require('./js/queriesFaculties');
var queriesGroups = require('./js/queriesGroups');

app.use(bodyParser.json());

app.use(cookieParser());
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
}));

app.set('views', path.join(__dirname, 'pages'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'pages')));
app.use(bodyParser.urlencoded({ extended: true }));

var jsonParser = bodyParser.json();
var textParser = bodyParser.text();
app.use(jsonParser);
app.use(textParser);

app.get('/', function (req, res) {
  if (req.session.userType == undefined || req.session.userType.length <= 0) {
    res.sendFile(path.join(__dirname, 'pages/sign_in.html'));
  } else {
    res.redirect('/faculties/');
  }
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
        req.session.userType = userType;
        req.session.login = userData.login;
        console.log("Login succeeded: ", req.session.login);
        res.redirect('/');
      } else {
        console.log("Login failed: ", req.body.login)
        res.status(401).send('Login error');
      }
      checkUserLogin.unprepare();
    });
  });
});

app.get('/logout', function (req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Failed to destroy session:', err);
      return res.status(500).send('Logout error');
    }
    res.redirect('/');
  });
});



var routerFaculties = express.Router();
routerFaculties.route("/").get(function (req, res)
{
  queriesFaculties.getAllItems(req, res);
})
routerFaculties.route("/add").get(function (req, res) {
  if (req.isAdmin == false) res.status(403).send('Access Denied!');
  queriesFaculties.renderAddValues(req, res);
});
routerFaculties.route("/add/addItem").post(function (req, res) {
  if (req.isAdmin == false) res.status(403).send('Access Denied!');
  queriesFaculties.insertItem(req, res);
});
routerFaculties.route("/change/:id").get(function (req, res) {
  if (req.isAdmin == false) res.status(403).send('Access Denied!');
  queriesFaculties.renderChangeValues(req, res);
});
routerFaculties.route("/change/:id").put(function (req, res) {
  if (req.isAdmin == false) res.status(403).send('Access Denied!');
  queriesFaculties.updateItem(req, res);
});
routerFaculties.route("/delete/:id").delete(function (req, res) {
  if (req.isAdmin == false) res.status(403).send('Access Denied!');
  queriesFaculties.deleteItem(req, res);
});
app.use("/faculties", checkUserType, routerFaculties);

var routerGroups = express.Router();
routerGroups.route("/").get(function (req, res) {
  queriesGroups.getAllItems(req, res);
})
routerGroups.route("/add").get(function (req, res) {
  queriesGroups.renderAddValues(req, res);
});
routerGroups.route("/add/addItem").post(function (req, res) {
  queriesGroups.insertItem(req, res);
});
routerGroups.route("/change/:id").get(function (req, res) {
  console.log("enter to get");

  if (req.isAdmin == false) res.status(403).send('Access Denied!');
  queriesGroups.renderChangeValues(req, res);
});
routerGroups.route("/change/:id").put(function (req, res) {
  console.log("enter to put");

  if (req.isAdmin == false) res.status(403).send('Access Denied!');
  queriesGroups.updateItem(req, res);
});
routerGroups.route("/delete/:id").delete(function (req, res) {
  queriesGroups.deleteItem(req, res);
});
app.use("/groups", checkAdminType, routerGroups);


function checkUserType(req, res, next) {
  if (!req.session.userType || req.session.userType.length <= 0) {
    return res.status(403).send('Access Denied!');
  }
  else if (req.session.userType == 'admin')
  {
    req.isAdmin = true;
  }
  else req.isAdmin = false;
  next();
}

function checkAdminType(req, res, next) {
  if (!req.session.userType || req.session.userType.length <= 0 || req.session.userType != 'admin') {
    res.status(403).send('Access Denied!');
  } else {
    req.isAdmin = true;
  }
  next();
}

// обработка ошибок 
app.use(function (err, req, res, next) {
  if (err) console.log(err.stack);
  res.status(500).send('oops...something went wrong');
});

app.listen(port, function () {
  console.log('app listening on port ' + port);
});  