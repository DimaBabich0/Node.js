var express = require('express');
var fs = require('fs');
var path = require('path');
var app = express();

app.get('/product/:productId', function (req, res)
{
  var file_path = path.join(__dirname, 'products.json');
  fs.readFile(file_path, function (err, data)
  {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    var products = JSON.parse(data);

    const product = products.find(elem => elem.name.toLowerCase() === req.params['productId'].toLowerCase());
    if (product) {
      res.write(`Name: ${product.name}\nPrice: ${product.price}\nCPU: ${product.cpu}\nGraphic card: ${product.graphic_card}`);
    }
    else {
      res.write(`Product not found`);
    }

    res.end();
  })
});

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});