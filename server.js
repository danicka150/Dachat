const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const users = {}; // {socket.id: {nick, pass}}

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  socket.on('login', ({ nick, pass }) => {
    users[socket.id] = { nick, pass };
    socket.broadcast.emit('system', `${nick} вошел в чат`);
  });

  socket.on('message', (msg) => {
    const user = users[socket.id];
    if (!user) return;
    io.emit('chat', { nick: user.nick, msg });
  });

  socket.on('private', ({ to, msg }) => {
    const fromUser = users[socket.id];
    if (!fromUser) return;
    const targetSocketId = Object.keys(users).find(
      (id) => users[id].nick === to
    );
    if (targetSocketId) {
      io.to(targetSocketId).emit('private', {
        from: fromUser.nick,
        msg,
      });
    }
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      io.emit('system', `${user.nick} покинул чат`);
      delete users[socket.id];
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
