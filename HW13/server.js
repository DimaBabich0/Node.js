var express  = require('express'); 
var app = express();

var path = require('path');
var bodyParser = require('body-parser'); 
var queriesGroups = require('./js/queriesGroups');
var queriesFaculties = require('./js/queriesFaculties');
// var queriesGroups = require('./js/queriesGroups');

var port = 8080; 

// установка генератора шаблонов 
app.set('views', __dirname + '/pages'); 
app.set('view engine', 'ejs');

// подгрузка статических файлов из папки pages 
app.use(express.static(path.join(__dirname, 'pages')));
app.use(bodyParser.urlencoded({ extended: true }));

// middleware для обработки данных в формате JSON 
var jsonParser = bodyParser.json();
var textParser = bodyParser.text(); 

app.use(jsonParser); 
app.use(textParser); 

// загрузить таблицу с элементами 
app.get('/', function(req, res) { 
	res.send('Type in URL table name: "faculties", "groups" or "students');
});

var routerGroup = express.Router();
routerGroup.route("/").get(function (req, res) {
	queriesGroups.getAllItems(req, res);
})
routerGroup.route("/add").get(function (req, res) {
	queriesGroups.renderValues(req, res);
});
routerGroup.route("/add/addItem").post(function (req, res) {
	queriesGroups.insertItem(req, res);
});
routerGroup.route("/delete/:id").delete(function (req, res) {
	queriesGroups.deleteItem(req, res);
});


var routerFaculties = express.Router();
routerFaculties.route("/").get(function (req, res) {
  queriesFaculties.getAllItems(req, res);
})
routerFaculties.route("/add").get(function (req, res) {
	queriesFaculties.renderValues(req, res);
});
routerFaculties.route("/add/addItem").post(function (req, res) {
	queriesFaculties.insertItem(req, res);
});
routerFaculties.route("/delete/:id").delete(function (req, res) {
	queriesFaculties.deleteItem(req, res);
});

app.use("/groups", routerGroup);
app.use("/faculties", routerFaculties);


// // загрузка страницы для создания нового элемента 
// app.get('/add', insertHandler.loadAddPage);

// // добавить новый элемент 
// app.post('/add/newItem', insertHandler.addRow);

// // отобразить элементы в режиме редактирования 
// app.get('/edit', function(req, res) {queries.getAllItems(req, res)});

// // загрузка страницы для редактирования элементов 
// app.get('/edit/:id', editHandler.loadEditPage);

// // редактирование элемента в бд 
// app.put('/edit/:id', editHandler.changeItem);

// // удаление элемента из бд 
// app.delete('/edit/:id', editHandler.removeItem);

// обработка ошибок 
app.use(function(err, req, res, next) {
	if (err) console.log(err.stack);
	res.status(500).send('oops...something went wrong');
});

app.listen(port, function() {
	console.log('app listening on port ' + port);
});  

// var connection = new mssql.ConnectionPool(config);
// app.get('/', function (req, res) {
// 	connection.connect(function (err) {
// 		// транзакция - безопасная операция над бд с возможностью отката изменений в случае ошибки при выполнении запроса
// 		var transaction = new mssql.Transaction(connection);
// 		transaction.begin(function (err) {
// 			var request = new mssql.Request(transaction);
// 			request.query("INSERT INTO Accounts (login, password) VALUES ('Login_1', '123')", function (err, data) {
// 				if (err) {
// 					console.log(err);
// 					transaction.rollback(function (err) {
// 						console.log('rollback successful');
// 						res.send('transaction rollback successful');
// 					});
// 				} else {
// 					transaction.commit(function (err, data) {
// 						console.log('data commit success');
// 						res.send('transaction successful');
// 					});
// 				};
// 			});
// 		});
// 	});
// });