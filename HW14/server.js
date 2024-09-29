var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mssql = require('mssql');
var connection = require('./js/config');
var port = 8080;

// подключение модулей для обработки запросов 
var displayHandler = require('./js/displayhandler');
var insertHandler = require('./js/inserthandler');
var editHandler = require('./js/edithandler');

// установка генератора шаблонов 
app.set('views', __dirname + '/pages');
app.set('view engine', 'ejs');

// подгрузка статических файлов из папки pages 
app.use(express.static(path.join(__dirname, 'pages')));

//cookie
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// middleware для обработки данных в формате JSON 
var jsonParser = bodyParser.json();
var textParser = bodyParser.text();

app.use(jsonParser);
app.use(textParser);

app.get('/', function (req, res) {
	if (!req.cookies.isLoggedIn || req.cookies.isLoggedIn === undefined) {
		res.render('sign_in');
	} else {
		displayHandler.displayItems(req, res);
	}
});

app.post('/', function (req, res) {
	var inserts = {
		login: req.body.login,
		password: req.body.password
	};

	var query = `SELECT * FROM Admins WHERE login = @login AND password = @password`;

	var request = new mssql.Request(connection);
	request.input('login', mssql.VarChar, inserts.login);
	request.input('password', mssql.VarChar, inserts.password);

	request.query(query, function (err, result) {
		if (err) {
			console.log(err);
		}

		if (result.recordset.length > 0) {
			res.cookie('isLoggedIn', true, { httpOnly: true });
			res.redirect('/');
		} else {
			console.log("Неправильные логин и/или пароль")
			res.render('sign_in');
		}
	});
});

// загрузка страницы для создания нового элемента 
app.get('/add', insertHandler.loadAddPage);
// добавить новый элемент 
app.post('/add/newItem', insertHandler.addRow);

// отобразить элементы в режиме редактирования 
app.get('/edit', displayHandler.displayItems);

// загрузка страницы для редактирования элементов 
app.get('/edit/:id', editHandler.loadEditPage);

// редактирование элемента в бд 
app.put('/edit/:id', editHandler.changeItem);

// удаление элемента из бд 
app.delete('/edit/:id', editHandler.removeItem);

// обработка ошибок 
app.use(function (err, req, res, next) {
	if (err) console.log(err.stack);
	res.status(500).send('oops...something went wrong');
});

app.listen(port, function () {
	console.log('app listening on port ' + port);
});  