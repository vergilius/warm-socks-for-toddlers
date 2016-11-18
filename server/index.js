const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = 3000;

app.use(express.static(path.resolve(__dirname, '../client')));

io.on('connection', (socket) => {
  console.log('socket connected');

  socket.on('event', (data) => {
    console.log('event', data);

    setTimeout(() => socket.emit('event', 'hey ho'), 1000);
  });
  socket.on('disconnect', () => {
    console.log('disconnected')
  });
});

server.listen(port, () => console.log('server running at port:', port));
