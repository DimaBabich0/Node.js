var mssql = require('mssql');
var connection = require('./config');

module.exports = {
	nameTable: 'faculties',
	values: [
		{ id: 'Name', text: 'Название факультета' },
	],
	URLS: {
		url: '/faculties',
		addUrl: `/faculties/add`,
		editUrl: `/faculties/edit`,
	},
	categories: `
		<th>Name</th>
	`,
	tableRows: '',
	// выбор всех элементов и отображение в виде таблицы 
	getAllItems: function (req, res) {
		var self = this;
		self.tableRows = ``;

		var request = new mssql.Request(connection);
		request.stream = true;
		request.query("SELECT * FROM Faculties");

		request.on('row', function (row) {
			self.tableRows += ` <tr>
							<td><span class="glyphicon glyphicon-remove delete" style="cursor: pointer" 
							Id="${row.Id}"> &nbsp; </span>
							${row.Name} </td>
						</tr>`
		});

		request.on('done', function (affected) {
			if (req.url == '/') {
				var options = { edit: false }
			} else {
				var options = { edit: true }
			}

			if (req.url == '/') {
				res.render('index', { data: self.tableRows, nameTable: self.nameTable, categories: self.categories, URLS: self.URLS, buttons: false });
			} else {
				res.render('index', { data: self.tableRows, nameTable: self.nameTable, categories: self.categories, URLS: self.URLS, buttons: true });
			}
		})

	},
	// показать данные для добавления объекта 
	renderValues: function (req, res) {
		res.render('add_item_page', { nameTable: this.nameTable, inputs: this.values });
	},
	// добавить элемент в бд
	insertItem: function (req, res) {
		var inserts = {
			Name: req.body.Name
		}

		var transaction = new mssql.Transaction(connection);

		transaction.begin(function (err) {
			if (err) {
				console.log('Ошибка начала транзакции:', err);
				res.status(500).send('Ошибка начала транзакции');
				return;
			}

			// SQL-запросы
			const checkFacultyQuery = 'SELECT Id FROM Faculties WHERE Name = @Name';
			const insertFacultyQuery = 'INSERT INTO Faculties (Name) VALUES (@Name)';

			// Проверка существует ли элемент с таким именем
			const requestCheckFaculty = new mssql.Request(transaction);
			requestCheckFaculty.input('Name', mssql.VarChar, inserts.Name).query(checkFacultyQuery, function (err, checkResult) {
				if (err) {
					console.log('Ошибка запроса:', err);
					transaction.rollback(function () {
						res.status(500).send('Ошибка при запросе данных');
					});
					return;
				}

				if (checkResult.recordset.length > 0) {
					res.status(400).send('Факультет с таким именем уже существует');
					transaction.rollback(function () {
						console.log('Транзакция откатана');
					});
					return;
				}

				// Добавляем новый факультет
				const requestAddFaculty = new mssql.Request(transaction);
				requestAddFaculty.input('Name', mssql.VarChar, inserts.Name).query(insertFacultyQuery, function (err) {
					if (err) {
						console.log('Ошибка при добавлении факультета:', err);
						transaction.rollback(function () {
							res.status(500).send('Ошибка при добавлении факультета');
						});
						return;
					}

					// Коммитим транзакцию
					transaction.commit(function (err) {
						if (err) {
							console.log('Ошибка при коммите транзакции:', err);
							res.status(500).send('Ошибка при сохранении данных');
						} else {
							console.log('Факультет успешно добавлен');
							res.send('Факультет успешно добавлен');
						}
					});
				});
			});
		});
	},
	// // обновить элемент 
	// updateItem: function (req, res) {
	// 	var inserts = {
	// 		Id: parseInt(req.body.Id),
	// 		Name: req.body.Name,
	// 	};

	// 	var ps = new mssql.PreparedStatement(connection);

	// 	ps.input('Id', mssql.Int);
	// 	ps.input('Name', mssql.VarChar);

	// 	ps.prepare("UPDATE Faculties SET Name=@Name WHERE Id=@Id", function (err) {
	// 		if (err) console.log(err)
	// 		ps.execute(inserts, function (err) {
	// 			if (err) console.log(err);
	// 			console.log('Item updated');
	// 			ps.unprepare();
	// 		});
	// 	});
	// },
	deleteItem: function (req, res) {
		var inserts = {
			Id: parseInt(req.params.id)
		};

		var ps = new mssql.PreparedStatement(connection);
		ps.input('Id', mssql.Int);
		ps.prepare('DELETE FROM Faculties WHERE Id=@Id', function (err) {
			if (err) console.log(err)
			ps.execute(inserts, function (err) {
				if (err) console.log(err);
				console.log('Item deleted');
				ps.unprepare();
				res.send('OK');
			});
		});
	}
}