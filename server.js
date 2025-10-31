const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Статические файлы (index.html и всё остальное)
app.use(express.static(__dirname));

// Список подключённых пользователей
const users = {};

io.on('connection', (socket) => {
  console.log('Новый пользователь подключился');

  // Вход с ником
  socket.on('login', ({ nick }) => {
    if (!nick || nick.trim().length === 0) {
      socket.emit('login-result', { success: false, msg: 'Введите ник' });
      return;
    }
    nick = nick.trim();
    socket.nick = nick;
    users[nick] = socket.id;
    socket.emit('login-result', { success: true, nick });
    io.emit('system', ${nick} вошёл в чат);
    console.log(Пользователь вошёл: ${nick});
  });

  // Общие сообщения
  socket.on('message', (msg) => {
    if (!socket.nick) return; // Ник не введён
    io.emit('chat', { nick: socket.nick, msg });
  });

  // Приватные сообщения
  socket.on('private', ({ to, msg }) => {
    if (!socket.nick) return;
    const id = users[to];
    if (id) {
      io.to(id).emit('private', { from: socket.nick, msg });
    } else {
      socket.emit('system', Пользователь ${to} не в сети);
    }
  });

  // Отключение
  socket.on('disconnect', () => {
    if (socket.nick) {
      io.emit('system', ${socket.nick} покинул чат);
      delete users[socket.nick];
    }
  });
});

// Render порт
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(Сервер запущен на порту ${PORT});
});