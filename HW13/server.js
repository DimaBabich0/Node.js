var express  = require('express'); 
var app = express();

var path = require('path');
var bodyParser = require('body-parser'); 
var queriesGroups = require('./js/queriesGroups');
var queriesFaculties = require('./js/queriesFaculties');

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

// обработка ошибок 
app.use(function(err, req, res, next) {
	if (err) console.log(err.stack);
	res.status(500).send('oops...something went wrong');
});

app.listen(port, function() {
	console.log('app listening on port ' + port);
});  
