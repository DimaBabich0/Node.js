var fileReader = require('./fileStream.js');
var reader = new fileReader.FileStream('data.txt');

reader.readDataFromFile(function (responce)
{
  console.log(responce);
});

reader.writeDataToFile("Text", function (responce)
{
  console.log(responce);
});
