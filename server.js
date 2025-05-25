const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

const users = {}; // socket.id => username

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('set username', (username, callback) => {
    if (Object.values(users).includes(username)) {
      callback({ success: false, message: 'Username already taken' });
    } else {
      users[socket.id] = username;
      callback({ success: true });
      socket.broadcast.emit('user joined', `${username} joined the chat`);
    }
  });

  socket.on('chat message', (msg) => {
    const username = users[socket.id];
    if (username) {
      io.emit('chat message', { username, msg });
    }
  });

  socket.on('disconnect', () => {
    const username = users[socket.id];
    if (username) {
      socket.broadcast.emit('user left', `${username} left the chat`);
      delete users[socket.id];
    }
  });
});

http.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
