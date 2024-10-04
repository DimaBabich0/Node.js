window.onload = function () {
  var btn = document.getElementById('btn');
  var message_input = document.getElementById('inp');
  var message_container = document.getElementById('messages');
  var users_container = document.getElementById('users');

  var socket = io.connect('http://localhost:8080');

  const savedNickname = localStorage.getItem('nickname');
  if (savedNickname) {
    document.getElementById('nickname-container').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    socket.emit('new user', savedNickname);
  }

  // загружаем историю сообщений
  socket.on('load history', function (history) {
    history.forEach(function (message) {
      displayMessage(message);
    });
  });

  // отобразить новое сообщение
  socket.on('chat message', function (message) {
    displayMessage(message);
  })

  // обновляем список пользователей
  socket.on('update users', function (users) {
    updateUsersList(users);
  });

  btn.onclick = function () {
    const savedNickname = localStorage.getItem('nickname');
    if (savedNickname && message_input.value.trim() !== '') {
      socket.emit('send message', { username: savedNickname, text: message_input.value });
      message_input.value = '';
    }
  }

  message_input.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      btn.click();
    }
  });

  // функция отображения сообщения
  function displayMessage(message) {
    var display_message = `
      <div class="panel well">
        <h4>${message.username}: </h4>
        <h5>${message.text}</h5>
      </div>
    `;
    message_container.innerHTML += display_message;
  }

  // функция обновления списка пользователей
  function updateUsersList(users) {
    users_container.innerHTML = '';  // очищаем контейнер пользователей
    users.forEach(function (user) {
      var userElement = `<li class="list-group-item">${user}</li>`;
      // id="${message.socket}"
      users_container.innerHTML += userElement;
    });
  }
}

function saveNickname() {
  const nickname = document.getElementById('nickname').value;
  if (nickname) {
    localStorage.setItem('nickname', nickname);
    location.reload();
  } else {
    document.getElementById('error-content').style.display = 'block';
  }
}