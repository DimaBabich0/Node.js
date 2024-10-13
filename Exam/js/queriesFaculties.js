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
		editUrl: `/faculties/change`,
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
			if (req.isAdmin) {
				self.tableRows += ` <tr>
      		<td><span class="glyphicon glyphicon-pencil change" style="cursor: pointer" 
					id="${row.Id}"> &nbsp; </span> 
					<span class="glyphicon glyphicon-remove delete" style="cursor: pointer" 
					Id="${row.Id}"> &nbsp; </span>
					${row.Name} </td>
				</tr>`
			} else {
				self.tableRows += ` <tr>
      		<td>${row.Name} </td>
				</tr>`
			}
		});

		request.on('done', function (affected) {
			res.render('table_page', { data: self.tableRows, nameTable: self.nameTable, categories: self.categories, URLS: self.URLS, isShowButtons: req.isAdmin });
		})
	},
	// показать данные для добавления объекта 
	renderAddValues: function (req, res) {
		res.render('add_item_page', { nameTable: this.nameTable, inputs: this.values });
	},
	// показать данные для обновления объекта 
	renderChangeValues: function (req, res) {
		res.render('edit_item_page', { nameTable: this.nameTable, inputs: this.values, id: req.params.id });
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
	// обновить элемент 
	updateItem: function (req, res) {
		const inserts = {
			Id: parseInt(req.body.Id),
			Name: req.body.Name
		};

		const transaction = new mssql.Transaction(connection);

		transaction.begin((err) => {
			if (err) {
				console.log('Ошибка начала транзакции:', err);
				return res.status(500).send('Ошибка начала транзакции');
			}

			// SQL-запрос для проверки наличия факультета с таким же именем (но исключаем текущий ID)
			const checkDuplicateQuery = `
				SELECT Id FROM Faculties 
				WHERE Name = @Name AND Id != @Id
			`;

			const requestCheckDuplicate = new mssql.Request(transaction);
			requestCheckDuplicate
				.input('Name', mssql.VarChar, inserts.Name)
				.input('Id', mssql.Int, inserts.Id)
				.query(checkDuplicateQuery, (err, result) => {
					if (err) {
						console.log('Ошибка запроса:', err);
						return transaction.rollback(() => {
							res.status(500).send('Ошибка при проверке данных');
						});
					}

					if (result.recordset.length > 0) {
						console.log('Факультет с таким именем уже существует');
						return transaction.rollback(() => {
							res.status(400).send('Факультет с таким именем уже существует');
						});
					}

					// Запрос на обновление факультета
					const updateQuery = `
						UPDATE Faculties 
						SET Name = @Name 
						WHERE Id = @Id
					`;

					const requestUpdate = new mssql.Request(transaction);
					requestUpdate
						.input('Name', mssql.VarChar, inserts.Name)
						.input('Id', mssql.Int, inserts.Id)
						.query(updateQuery, (err, result) => {
							if (err) {
								console.log('Ошибка при обновлении:', err);
								return transaction.rollback(() => {
									res.status(500).send('Ошибка при обновлении данных');
								});
							}

							// Коммит транзакции
							transaction.commit((err) => {
								if (err) {
									console.log('Ошибка при коммите транзакции:', err);
									return res.status(500).send('Ошибка при сохранении данных');
								}
								console.log('Факультет успешно обновлен');
								res.send('Факультет успешно обновлен');
							});
						});
				});
		});
	},
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