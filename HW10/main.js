var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mssql = require('mssql');
var connection = require('./config');
var fs = require('fs');
var app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'pages'));

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  var file_path = path.join(__dirname, '/pages/home_page.html');
  fs.readFile(file_path, function (err, data) {
    if (err) {
      console.log(err);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.write('Not Found!');

    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(data.toString());
    }
    res.end();
  })
});

app.get('/sign_up', function (req, res) {
  var file_path = path.join(__dirname, '/pages/sign_up.html');
  fs.readFile(file_path, function (err, data) {
    if (err) {
      console.log(err);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.write('Not Found!');

    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(data.toString());
    }
    res.end();
  })
});

app.get('/sign_in', function (req, res) {
  var file_path = path.join(__dirname, '/pages/sign_in.html');
  fs.readFile(file_path, function (err, data) {
    if (err) {
      console.log(err);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.write('Not Found!');

    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(data.toString());
    }
    res.end();
  })
});

app.post('/sign_up', function (req, res) {
  var userData = {
    login: req.body.login,
    name: req.body.name,
    password: req.body.password
  };

  var checkUserLogin = new mssql.PreparedStatement(connection);
  checkUserLogin.input('login', mssql.VarChar(50));

  var checkLogin = `
    SELECT login FROM Users WHERE login = @login
    UNION
    SELECT login FROM Admins WHERE login = @login
    `;
  checkUserLogin.prepare(checkLogin, function (err) {
    if (err) {
      console.log(err);
      return res.send('Error preparing query');
    }

    checkUserLogin.execute({ login: userData.login }, function (err, result) {
      if (result.recordset.length > 0) {
        return res.send('Login already exists');
      }

      var ps = new mssql.PreparedStatement(connection);
      ps.input('login', mssql.Text);
      ps.input('name', mssql.Text);
      ps.input('password', mssql.Text);

      ps.prepare("INSERT INTO Users (login, name, password) VALUES (@login, @name, @password)", function (err) {
        if (err) {
          console.log(err);
        }
        ps.execute(userData, function (err) {
          if (err) {
            console.log(err);
          }
          ps.unprepare();
          res.redirect('/');
        });
      });
    });
  });
});

app.post('/sign_in', function (req, res) {
  var data = {
    login: req.body.login,
    password: req.body.password
  };

  var ps = new mssql.PreparedStatement(connection);

  ps.input('login', mssql.VarChar(50));
  ps.input('password', mssql.VarChar(50));

  var loginQuery = `
    SELECT 'user' AS userType FROM Users WHERE login = @login AND password = @password
    UNION
    SELECT 'admin' AS userType FROM Admins WHERE login = @login AND password = @password
  `;

  ps.prepare(loginQuery, function (err) {
    if (err) {
      console.log(err);
      return res.send('Error preparing query');
    }

    ps.execute(data, function (err, result) {
      if (result.recordset.length > 0) {
        var userType = result.recordset[0].userType;
        if (userType == 'admin') {
          var userQuery = "SELECT name, login, password FROM Users";

          var userPs = new mssql.PreparedStatement(connection);
          userPs.prepare(userQuery, function (err) {
            userPs.execute({}, function (err, userResult) {
              if (err) {
                console.log(err);
              }
              var users = userResult.recordset;
              var table = '';
              users.forEach(user => {
                table += `<tr>
                <td>${user.name} </td>
                <td>${user.login}</td>
                <td>${user.password}</td>
              </tr>`
              });
              res.render('table', { table: table });
              userPs.unprepare();
            });
          });
        } else {
          res.redirect('/');
        }
      } else {
        res.send('Invalid login or password');
      }
      ps.unprepare();
    });
  });
});

app.listen(8080, function () {
  console.log('Server started on port: 8080');
});