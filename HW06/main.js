var express = require('express');
var fs = require('fs');
var path = require('path');
var app = express();

app.get('/', function (request, res) {
  var file_path = path.join(__dirname, 'html/home_page.html');
  fs.readFile(file_path, function (err, data)
  {
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

app.get('/about', function (request, res) {
  var file_path = path.join(__dirname, 'html/about_us.html');
  fs.readFile(file_path, function (err, data)
  {
    // обработка ошибок
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

app.get('/news', function (request, res) {
  var file_path = path.join(__dirname, 'html/news.html');
  fs.readFile(file_path, function (err, data)
  {
    // обработка ошибок
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

app.get('/sign_in', function (request, res) {
  var file_path = path.join(__dirname, 'html/sign_in.html');
  fs.readFile(file_path, function (err, data)
  {
    // обработка ошибок
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

app.get('/sign_up', function (request, res) {
  var file_path = path.join(__dirname, 'html/sign_up.html');
  fs.readFile(file_path, function (err, data)
  {
    // обработка ошибок
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

app.listen(8080, function () {
  console.log('Server start')
});
