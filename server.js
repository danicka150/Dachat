const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ✅ Render автоматически даёт переменную PORT
const PORT = process.env.PORT || 3000;

// ✅ Чтобы сайт открывал index.html из папки public
app.use(express.static(path.join(__dirname, 'public')));

// 🔸 Список подключённых пользователей
const users = {};

io.on('connection', (socket) => {
  console.log('Новое подключение');

  socket.on('login', ({ nick, pass }) => {
    socket.nick = nick;
    users[nick] = socket.id;
    io.emit('system', ${nick} вошёл в чат);
  });

  socket.on('message', (msg) => {
    if (!socket.nick) return;
    io.emit('chat', { nick: socket.nick, msg });
  });

  socket.on('private', ({ to, msg }) => {
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

server.listen(PORT, () => {
  console.log(✅ Сервер запущен на порту ${PORT});
});