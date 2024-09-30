var mssql = require('mssql');

var config = {
	user: 'admin',
	password: 'admin',
	server: 'DESKTOP-REVRHUK',
	database: 'testdb',
	port: 1433,
	options: {
		encrypt: true,
		trustServerCertificate: true
	}
}

var connection = new mssql.ConnectionPool(config); 

var pool = connection.connect(function(err) {
	if (err) console.log(err)
}); 

module.exports = pool; 