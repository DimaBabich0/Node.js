var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
const port = 8080;

var server = http.createServer(function (req, res) {
  // обработка ошибок запроса
  req.on('error', function (err) {
    console.log(err);
  });

  if (req.url == "/") {
    // чтение файла index.html
    var file_path = path.join(__dirname, 'index.html');
    fs.readFile(file_path, function (err, data) {

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
  }

  //получения данных от клиента и отправка сообщения
  req.on('data', function (data) {
    res.writeHead(200, { 'Content-Type': 'application/plain' });
    res.write("Авторизация выполнена успешно");
    res.end();

    console.log('Data sent');
    var asnwerJSON = JSON.parse(data.toString());
    let result = `Login: ${asnwerJSON.login}; Password: ${asnwerJSON.password}`;
    fs.writeFileSync('result.txt', result);
    console.log('Result was saved to file');
  });
}).listen(port);

console.log('Server running on port ' + port); 
