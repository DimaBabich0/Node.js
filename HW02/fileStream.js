var evt = require('events');

function FileStream(file)
{
  this._file = file;
}
FileStream.prototype = new evt.EventEmitter();

FileStream.prototype.readDataFromFile = function (callback)
{
  if (typeof callback == 'function') {
    this.once('readData', callback)
  }
  this._read();
};

FileStream.prototype.writeDataToFile = function (data, callback)
{
  if (typeof callback == 'function') {
    this.once('writeData', callback)
  }
  this._write(data);
};

FileStream.prototype._read = function ()
{
  console.log('Data from file:');
  this.emit('readData', 'Text');
}
FileStream.prototype._write = function (data)
{
  console.log(`Writing "${data}" to file`);
  this._data = data;
  this.emit('writeData', 'Data was written');
}

module.exports.FileStream = FileStream;
