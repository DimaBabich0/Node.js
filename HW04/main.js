var http = require('http');
var fs = require('fs');

http.createServer(function (res)
{
    var path = 'index.html';

    fs.readFile(path, function (err, data) {
        if (err) {
            console.log(err);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not found page');
        }
        else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data.toString());
            console.log('Data was sent');
            res.end();
        }
    });

}).listen(8080, function () {
    console.log('Server starting!');
});