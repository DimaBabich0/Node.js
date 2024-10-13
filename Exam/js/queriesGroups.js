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
		editUrl: `/groups/change`,
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
			if (req.isAdmin) {
				self.tableRows += ` <tr>
      		<td><span class="glyphicon glyphicon-pencil change" style="cursor: pointer" 
					id="${row.Id}"> &nbsp; </span> 
					<span class="glyphicon glyphicon-remove delete" style="cursor: pointer" 
					Id="${row.Id}"> &nbsp; </span>
					${row.GroupName} </td>
					<td>${row.FacultyName}</td>
				</tr>`
			} else {
				self.tableRows += ` <tr>
      		<td>${row.GroupName} </td>
					<td>${row.FacultyName}</td>
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
	// обновить элемент 
	updateItem: function (req, res) {
		const groupData = {
			Id: parseInt(req.body.Id),
			Name: req.body.Name,
			FacultyName: req.body.Id_Faculty
		};

		var transaction = new mssql.Transaction(connection);

		transaction.begin((err) => {
			if (err) {
				console.log('Ошибка начала транзакции:', err);
				return res.status(500).send('Ошибка начала транзакции');
			}

			const queryFindFacultyId = `
				SELECT Id FROM Faculties WHERE Name = @FacultyName
			`;

			var requestFindFaculty = new mssql.Request(transaction);
			requestFindFaculty.input('FacultyName', mssql.VarChar, groupData.FacultyName);

			requestFindFaculty.query(queryFindFacultyId, (err, result) => {
				if (err) {
					console.log('Ошибка при поиске факультета:', err);
					return transaction.rollback((rollbackErr) => {
						if (rollbackErr) console.log('Ошибка отката транзакции:', rollbackErr);
						res.status(500).send('Ошибка при поиске факультета');
					});
				}

				if (result.recordset.length === 0) {
					console.log('Факультет не найден');
					return transaction.rollback(() => {
						res.status(404).send('Факультет не найден');
					});
				}

				const facultyId = result.recordset[0].Id;

				const queryUpdateGroup = `
					UPDATE Groups 
					SET Name = @Name, Id_Faculty = @Id_Faculty 
					WHERE Id = @Id
				`;

				var requestUpdateGroup = new mssql.Request(transaction);
				requestUpdateGroup.input('Id', mssql.Int, groupData.Id);
				requestUpdateGroup.input('Name', mssql.VarChar, groupData.Name);
				requestUpdateGroup.input('Id_Faculty', mssql.Int, facultyId);

				requestUpdateGroup.query(queryUpdateGroup, (err, result) => {
					if (err) {
						console.log('Ошибка при обновлении группы:', err);
						return transaction.rollback((rollbackErr) => {
							if (rollbackErr) console.log('Ошибка отката транзакции:', rollbackErr);
							res.status(500).send('Ошибка при обновлении группы');
						});
					}

					transaction.commit((err) => {
						if (err) {
							console.log('Ошибка коммита транзакции:', err);
							return res.status(500).send('Ошибка при сохранении данных');
						}
						console.log('Группа успешно обновлена');
						res.send('Группа успешно обновлена');
					});
				});
			});
		});
	},
	// удалить элемент 
	deleteItem: function (req, res) {
		const self = this;
		const groupId = parseInt(req.params.id);

		const transaction = new mssql.Transaction(connection);
		transaction.begin((err) => {
			if (err) {
				console.log('Ошибка начала транзакции:', err);
				return res.status(500).send('Ошибка начала транзакции');
			}

			const deleteQuery = `DELETE FROM Groups WHERE Id = @Id`;

			const requestDelete = new mssql.Request(transaction);
			requestDelete.input('Id', mssql.Int, groupId);

			requestDelete.query(deleteQuery, (err, result) => {
				if (err) {
					console.log('Ошибка при удалении группы:', err);
					return transaction.rollback((rollbackErr) => {
						if (rollbackErr) console.log('Ошибка отката транзакции:', rollbackErr);
						res.status(500).send('Ошибка при удалении группы');
					});
				}

				if (result.rowsAffected[0] === 0) {
					console.log('Группа не найдена');
					return transaction.rollback(() => {
						res.status(404).send('Группа не найдена');
					});
				}

				transaction.commit((err) => {
					if (err) {
						console.log('Ошибка коммита транзакции:', err);
						return res.status(500).send('Ошибка при сохранении данных');
					}
					console.log('Группа успешно удалена');
					res.send('Группа успешно удалена');
				});
			});
		});
	}
}