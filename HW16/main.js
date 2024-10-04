// подключение express и socket.io 
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var port = 8080;

// массив для хранения текущих подключений 
var connections = [];

// массив для хранения сообщений
var messagesHistory = [];

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/client.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'client.js'));
});

// установка соединения
io.on('connection', function (socket) {
  // обработка нового пользователя
  socket.on('new user', function (username) {
    // добавляем пользователя в connections
    connections.push({ socket: socket, username: username });
    updateUsersList();
    console.log(`User connected: ${username}. Total users: ${connections.length}`);

    // отправляем историю сообщений новому пользователю
    socket.emit('load history', messagesHistory);
  });

  socket.on('send message', function (data) {
    // добавляем сообщение в историю
    messagesHistory.push(data);
    // сгенерировать событие chat message и отправить его всем доступным подключениям 
    io.sockets.emit('chat message', data);
  })

  socket.on('disconnect', function (data) {
    // находим и удаляем пользователя из connections
    const disconnectedUser = connections.find(item => item.socket === socket);
    if (disconnectedUser) {
      connections = connections.filter(item => item.socket !== socket);
      console.log(`User disconnected: ${disconnectedUser.username}. Total users: ${connections.length}`);
      updateUsersList();  // обновляем список пользователей
    }
  })
})

server.listen(port, function () {
  console.log('app running on port ' + port);
})

// функция для обновления списка пользователей
function updateUsersList() {
  const users = connections.map(item => item.username); // получаем список всех пользователей
  io.sockets.emit('update users', users); // отправляем обновлённый список всем
}