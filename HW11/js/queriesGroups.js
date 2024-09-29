var mssql = require('mssql');
var connection = require('./config');

module.exports = {
	nameTable: 'groups',
	values: [
		{ id: 'Name', text: 'Название группы' },
		{ id: 'Id_Faculty', text: 'Название факультета' }
	],
	URLS: {
		url: '/groups',
		addUrl: `/groups/add`,
		editUrl: `/groups/edit`,
	},
	categories: `
		<th>Name</th>
		<th>Faculty name</th>
	`,
	tableRows: '',
	// выбор всех элементов и отображение в виде таблицы 
	getAllItems: function (req, res) {
		var self = this;
		self.tableRows = ``;

		var request = new mssql.Request(connection);
		request.stream = true;
		request.query(`
			SELECT g.Id, g.Name AS GroupName, g.Id_Faculty, f.Name AS FacultyName
			FROM Groups g
			JOIN Faculties f ON g.Id_Faculty = f.Id;
		`);

		request.on('row', function (row) {
			self.tableRows += ` <tr>
							<td><span class="glyphicon glyphicon-remove delete" style="cursor: pointer" 
							id="${row.Id}"> &nbsp; </span>
							${row.GroupName} </td>
							<td>${row.FacultyName}</td>
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
				res.render('index', { data: self.tableRows, nameTable: self.nameTable, categories: self.categories, URLS: self.URLS, buttons: false });
			}
		})

	},
	// показать данные для добавления объекта 
	renderValues: function (req, res) {
		res.render('add_item_page', { nameTable: this.nameTable, inputs: this.values });
	},
	// добавить элемент в бд
	insertItem: function (req, res) {
		const facultyName = req.body.Id_Faculty;
		var inserts = {
			Name: req.body.Name,
			Id_Faculty: ''
		}

		var transaction = new mssql.Transaction(connection);

		transaction.begin(function (err) {
			if (err) {
				console.log('Ошибка начала транзакции:', err);
				res.status(500).send('Ошибка начала транзакции');
				return;
			}
			// Определяем SQL-запросы
			const checkFacultyQuery = 'SELECT Id FROM Faculties WHERE Name = @Name';
			const insertFacultyQuery = 'INSERT INTO Faculties (Name) OUTPUT INSERTED.Id VALUES (@Name)';
			const insertGroupQuery = 'INSERT INTO Groups (Name, Id_Faculty) VALUES (@Name, @Id_Faculty)';

			// 1. Проверяем, существует ли факультет с таким именем
			var requestCheckFaculty = new mssql.Request(transaction);
			requestCheckFaculty.input('Name', mssql.VarChar, facultyName).query(checkFacultyQuery, function (err, result) {
				if (err) {
					console.log('Ошибка запроса:', err);
					transaction.rollback(function (err) {
						if (err) console.log('Ошибка при откате транзакции:', err);
						res.status(500).send('Ошибка при запросе данных');
					});
					return;
				}

				// 2. Если факультет существует, берем его Id, иначе создаем новый
				if (result.recordset.length > 0) {
					inserts.Id_Faculty = result.recordset[0].Id;

					// Добавляем группу
					var requestAddGroups = new mssql.Request(transaction);
					requestAddGroups.input('Name', mssql.VarChar, inserts.Name)
						.input('Id_Faculty', mssql.Int, inserts.Id_Faculty)
						.query(insertGroupQuery, function (err, result) {
							if (err) {
								console.log('Ошибка при добавлении группы:', err);
								transaction.rollback(function (err) {
									if (err) console.log('Ошибка при откате транзакции:', err);
									res.status(500).send('Ошибка при добавлении группы');
								});
							} else {
								transaction.commit(function (err) {
									if (err) {
										console.log('Ошибка при коммите транзакции:', err);
										res.status(500).send('Ошибка при сохранении данных');
									} else {
										console.log('Транзакция успешно завершена');
										res.send('Группа успешно добавлена');
									}
								});
							}
						});
				} else {
					// Добавляем новый факультет
					var requestAddFaculty = new mssql.Request(transaction);
					requestAddFaculty.input('Name', mssql.VarChar, facultyName).query(insertFacultyQuery, function (err, result) {
						if (err) {
							console.log('Ошибка при добавлении факультета:', err);
							transaction.rollback(function (err) {
								if (err) console.log('Ошибка при откате транзакции:', err);
								res.status(500).send('Ошибка при добавлении факультета');
							});
							return;
						}
						inserts.Id_Faculty = result.recordset[0].Id;

						// Теперь добавляем группу
						var requestAddGroups = new mssql.Request(transaction);
						requestAddGroups.input('Name', mssql.VarChar, inserts.Name)
							.input('Id_Faculty', mssql.Int, inserts.Id_Faculty)
							.query(insertGroupQuery, function (err, result) {
								if (err) {
									console.log('Ошибка при добавлении группы:', err);
									transaction.rollback(function (err) {
										if (err) console.log('Ошибка при откате транзакции:', err);
										res.status(500).send('Ошибка при добавлении группы');
									});
								} else {
									transaction.commit(function (err) {
										if (err) {
											console.log('Ошибка при коммите транзакции:', err);
											res.status(500).send('Ошибка при сохранении данных');
										} else {
											console.log('Транзакция успешно завершена');
											res.send('Группа успешно добавлена');
										}
									});
								}
							});
					});
				}
			});
		});
	},
	// // обновить элемент 
	// updateItem: function (req, res) {
	// 	var inserts = {
	// 		id: parseInt(req.body.id),
	// 		name: req.body.name,
	// 		description: req.body.description,
	// 		completed: parseInt(req.body.completed)
	// 	};

	// 	var ps = new mssql.PreparedStatement(connection);

	// 	ps.input('id', mssql.Int);
	// 	ps.input('name', mssql.Text);
	// 	ps.input('description', mssql.Text);
	// 	ps.input('completed', mssql.Int)

	// 	ps.prepare("UPDATE Groups SET name=@name, description=@description, completed=@completed WHERE id=@id", function (err) {
	// 		if (err) console.log(err)
	// 		ps.execute(inserts, function (err) {
	// 			if (err) console.log(err);

	// 			console.log('item updated');
	// 			ps.unprepare();
	// 		});
	// 	});
	// },
	deleteItem: function (req, res) {
		var self = this;
		var inserts = {
			Id: parseInt(req.params.id)
		};

		var ps = new mssql.PreparedStatement(connection);
		ps.input('Id', mssql.Int);
		ps.prepare('DELETE FROM Groups WHERE Id=@Id', function (err) {
			if (err) console.log(err)
			ps.execute(inserts, function (err) {
				if (err) console.log(err);
				console.log('item deleted');
				ps.unprepare();
				res.send('OK');
			});
		});
	}
}