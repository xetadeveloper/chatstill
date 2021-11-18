import express from 'express';
import path from 'path';
import { Server } from 'socket.io';
import { createServer } from 'http';
import fs from 'fs';

const app = express();
const httpServer = createServer(app);
const onlineList = [];

httpServer.on('connect', parent => {
  console.log('Connection to HTTP occured: ', parent);
});

httpServer.on('upgrade', socket => {
  // console.log('Connection upgrade...');
});

// Middleware
app.use(express.static(path.join(path.resolve(), 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Normal HTTP
app.get('/', (req, res) => {
  res.send('Home route');
});

app.use((err, req, res, next) => {
  console.log('Error occured: ', err);
  res.send('Error Occured');
});

httpServer.listen(5000, () => {
  console.log('Server started on port 5000....');
});

// Websocket Connections
const io = new Server(httpServer);

io.on('connection', socket => {
  console.log('Some client connected..');

  socket.on('disconnect', () => {
    // emit to all users that this person has left
    socket.broadcast.emit(
      'user-left',
      socket.handshake.auth.username,
      socket.id,

      onlineList.filter(user => user.socketID === socket.id)
    );

    onlineList.forEach((user, index) => {
      if (user.socketID === socket.id) {
        // remove user from list
        onlineList.splice(index, 1);
      }
    });
  });

  socket.on('chat-message', msg => {
    console.log('Server received a chat message: ', msg);
    socket.broadcast.emit('chat-message', msg);
  });

  socket.on('login', callback => {
    // Check if username has been taken
    // if(username is ok){}
    // else{}
    const { username } = socket.handshake.auth;
    onlineList.push({ username, socketID: socket.id });

    console.log(`${username} just joined: `);
    console.log(
      'Online list now: ',
      onlineList.filter(user => user.username != username)
    );
    socket.broadcast.emit('user-joined', username, socket.id);
    callback({
      ok: true,
      onlineList: onlineList.filter(user => user.username != username),
    });
  });

  socket.on('private-message', (msg, to) => {
    console.log('A private message to: ', to);
    socket.to(to.socketID).emit('private-message', msg, {
      username: socket.handshake.auth.username,
      socketID: socket.id,
    });
  });
});
