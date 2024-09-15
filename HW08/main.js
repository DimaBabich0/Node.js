var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
var logger_file = 'logger.txt';

//logger
app.use(function (req, response, next) {
  var data = `Time: ${new Date().toLocaleString()}; URL: ${req.url}; IP: ${req.ip}; \n`;
  fs.appendFile(logger_file, data, function (err) {
    console.log('Data wrote');
  });
  next();
});

//product router
var productRouter = express.Router();
productRouter.route("/:productId").get(function (req, res) {
  var products_path = path.join(__dirname, 'products.json');
  fs.readFile(products_path, function (err, data) {
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
app.use("/product", productRouter);
app.get("/product", function (req, res) {
  var category_path = path.join(__dirname, "products.json");
  fs.readFile(category_path, function (err, data) {
    var categorys = JSON.parse(data.toString());
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    var result = "";

    for (let i = 0; i < categorys.length; i++) {
      const element = categorys[i];
      result += `${i + 1}. ${element.name}\n`;
    }

    res.write(result);
    res.end();
  })
});

//category router
var categoryRouter = express.Router();
categoryRouter.route("/:categoryName").get(function (req, res) {
  var category_path = path.join(__dirname, "category.json");
  fs.readFile(category_path, function (err, data) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    var categorys = JSON.parse(data.toString());
    const category = categorys.find(elem => elem.name.toLowerCase() === req.params['categoryName'].toLowerCase());
    if (category) {
      res.write(`${category.name} category`);
    }
    else {
      res.write(`Category not found`);
    }
    res.end();
  })
});
app.use("/category", categoryRouter);
app.get("/category", function (req, res) {
  var category_path = path.join(__dirname, "category.json");
  fs.readFile(category_path, function (err, data) {
    var categorys = JSON.parse(data.toString());
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    var result = "";

    for (let i = 0; i < categorys.length; i++) {
      const element = categorys[i];
      result += `${i + 1}. ${element.name}\n`;
    }

    res.write(result);
    res.end();
  })
});

app.get("/", function (req, res) {
  res.send("Главная страница");
});

app.listen(8080, function () {
  console.log('Server start')
});
