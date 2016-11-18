const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = 3000;

app.use(express.static(path.resolve(__dirname, '../client')));

let loggedInUsers = [];

function onAuthorize(socket, payload) {
  loggedInUsers.push(payload);
  myId = payload.id;

  socket.emit('moj-kanal-komunikacji', { action: 'authorized' });
}

function getUsersInChannel(channel) {
  return loggedInUsers.filter(u => u.channel === channel);
}

function onGetLoggedInUsers(socket,oldChannel,userId) {
  let currentUser = getCurrentUser(userId);
  
  if (!currentUser) {
    return;
  }

  let payload = getUsersInChannel(currentUser.channel);

  socket.emit('moj-kanal-komunikacji', { action: 'logged-in-users', payload: payload });
  
  if(oldChannel) {
    socket.broadcast.to(oldChannel).emit('moj-kanal-komunikacji', { action: 'user-has-left', payload: getUsersInChannel(currentUser.channel) });
  }

  socket.broadcast.to(currentUser.channel).emit('moj-kanal-komunikacji', { action: 'logged-in-users', payload: payload })
}

io.on('connection', (socket) => {

  socket.on('moj-kanal-komunikacji', (data) => {
    console.log('event', data);

    switch (data.action) {
      case 'authorize':
        onAuthorize(socket, data.payload);
        break;
      case 'switch-channel':
        socket.join(data.payload);
        let currentUser = getCurrentUser(data.userId);
        let oldChannel = currentUser.channel;
        if (currentUser) {
          currentUser.channel = data.payload;
        }
        onGetLoggedInUsers(socket, oldChannel, data.userId);
        break;
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnect');
  });
});


function getCurrentUser(id) {
  return loggedInUsers.filter(u => u.id === id)[0];
}

server.listen(port, () => console.log('server running at port:', port));
