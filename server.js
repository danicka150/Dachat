const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

const users = {};

io.on('connection', (socket) => {
  console.log('Новый пользователь подключился');

  socket.on('login', ({ nick }) => {
    if (!nick) {
      socket.emit('login-result', { success: false, msg: 'Введите ник' });
      return;
    }
    socket.nick = nick;
    users[nick] = socket.id;
    socket.emit('login-result', { success: true, nick }); // <- отправляем фронтенду "успех"
    io.emit('system', ${nick} вошёл в чат);
  });

  socket.on('message', (msg) => {
    if (!socket.nick) return;
    io.emit('chat', { nick: socket.nick, msg });
  });

  socket.on('private', ({ to, msg }) => {
    if (!socket.nick) return;
    const id = users[to];
    if (id) {
      io.to(id).emit('private', { from: socket.nick, msg });
    } else {
      socket.emit('system', Пользователь ${to} не в сети);
    }
  });

  socket.on('disconnect', () => {
    if (socket.nick) {
      io.emit('system', ${socket.nick} покинул чат);
      delete users[socket.nick];
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(Сервер запущен на порту ${PORT}));