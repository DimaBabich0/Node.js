var mssql = require('mssql');
var queries = require('./queries');
var Cookies = require('cookies');


module.exports = {
  displayItems: function (req, res) {
    var query = queries.getAllItems(req, res)
  },
  displaySignIn: function (req, res) {
    request.on('done', function (affected) {
      if (true) {
        res.render('index', { signIn: false });
      } else {
        res.render('index', { signIn: true, data: self.tableRows, buttons: true });
      }
    })
  }
};