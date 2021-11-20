import { Server } from 'socket.io';
import { getDBInstance } from './Database/mongoDB.js';
import { store } from './server.js';
import mongoTypes from 'mongodb';

const { ObjectId } = mongoTypes;

// Websocket Connections
export default function startWebsocket(httpServer) {
  const io = new Server(httpServer);

  //   Should be repopulated at start of server with database values
  const onlineList = [];

  io.on('connection', socket => {
    let sessID;
    const cookies = socket.request.headers.cookie.split(';');
    const chatSession = cookies.find(cookie => {
      return cookie.trim().startsWith('chat-session');
    });

    // This just splits the session cookie to get the id
    if (chatSession) {
      sessID = chatSession
        .split('=')[1]
        .trim()
        .split('s%3A')[1]
        .trim()
        .split('.')[0]
        .trim();
    }

    // console.log('Client connected with id: ', sessID);

    if (sessID) {
      store.get(sessID, (err, session) => {
        if (err) {
          console.log('Error occured getting session: ', err);
        }
        // console.log('session id found, ', session);
      });
    }

    // Listeners
    socket.on('disconnect', async () => {
      // emit to all users that this person has left
      //   console.log('Client doscnnectd: ');
      const username = socket.handshake.auth.username;

      try {
        const db = await getDBInstance();
        const usersCol = db.collection('users');

        const user = await usersCol.findOne(
          { username: username },
          { password: 0 }
        );

        socket.broadcast.emit('user-left', user);

        // Leave room
        socket.leave(user._id);

        const { acknowledged, modifiedCount } = await usersCol.updateOne(
          { username: username },
          { $set: { online: false } }
        );
      } catch (error) {
        socket.emit('db-error', { error });
      }
    });

    socket.on('chat-message', async msg => {
      // console.log('Server received a chat message: ', msg);
      // console.log('Group message from : ', socket.handshake.auth.username);

      try {
        const db = await getDBInstance();
        const messagesCol = db.collection('messages');

        const msgCount = await messagesCol.countDocuments({
          $and: [{ toUser: 'group' }, { type: 'group' }],
        });

        // console.log('msgCount: ', msgCount);

        await messagesCol.insertOne({
          type: 'group',
          fromUser: socket.handshake.auth.username,
          toUser: 'group',
          number: msgCount + 1,
          message: msg,
        });

        socket.broadcast.emit(
          'chat-message',
          msg,
          socket.handshake.auth.username
        );
      } catch (error) {
        console.log('Error occured: ', error);
      }
    });

    socket.on('login', async callback => {
      const { username } = socket.handshake.auth;

      try {
        const db = await getDBInstance();
        const usersCol = db.collection('users');
        const usersList = await usersCol.find({}).toArray();

        const user = usersList.find(user => user.username === username);

        //   Join a room
        socket.join(`${user._id}`);
        // console.log('Socket rooms: ', socket.rooms);

        console.log(`${username} just joined: `);

        // Tell others that user joined
        socket.broadcast.emit('user-joined', user);

        // Send info back to connected client
        callback({
          ok: true,
          userOnlineList: usersList.filter(
            user => user.username != username && user.online
          ),
          usersList: usersList.filter(user => user.username != username),
        });
      } catch (error) {
        socket.emit('db-error', { error });
      }
    });

    socket.on('private-message', async (msg, to) => {
      //   check if user is online forst
      try {
        const db = await getDBInstance();
        const usersCol = db.collection('users');

        const user = await usersCol.findOne({ _id: ObjectId(to._id) });
        // console.log('PM User: ', user);

        if (user.online) {
          console.log('getting message count');
          const messagesCol = db.collection('messages');

          const msgCount = await messagesCol.countDocuments({
            fromUser: { $in: [socket.handshake.auth.username, to.username] },
            toUser: { $in: [socket.handshake.auth.username, to.username] },
            type: 'private',
          });

          //   console.log('msgCount: ', msgCount);

          await messagesCol.insertOne({
            type: 'private',
            fromUser: socket.handshake.auth.username,
            toUser: user.username,
            number: msgCount + 1,
            message: msg,
          });

          socket
            .to(`${user._id}`)
            .emit('private-message', msg, socket.handshake.auth.username);
        } else {
          socket.emit('pm-offline', to, msg);
        }
      } catch (error) {
        console.log('Error in db: ', error);
        socket.emit('db-error', { error });
      }
    });

    socket.on('get-pm-messages', async (toUser, callback) => {
      try {
        console.log('Getting all pm messages: ', toUser);
        const db = await getDBInstance();
        const messagesCol = db.collection('messages');

        const msgList = await messagesCol
          .find({
            fromUser: { $in: [socket.handshake.auth.username, toUser] },
            toUser: { $in: [socket.handshake.auth.username, toUser] },
            type: 'private',
          })
          .toArray();

        // console.log('msgList gotten: ', msgList);

        callback(msgList);
      } catch (error) {
        console.log('Error occured in db: ', error);
      }
    });

    socket.on('get-group-messages', async (toUser, callback) => {
      try {
        console.log('Getting all group messages: ', toUser);
        const db = await getDBInstance();
        const messagesCol = db.collection('messages');

        const msgList = await messagesCol
          .find({
            $and: [{ toUser: 'group' }, { type: 'group' }],
          })
          .toArray();

        // console.log('msgList gotten: ', msgList);

        callback(msgList);
      } catch (error) {
        console.log('Error occured in db: ', error);
      }
    });
  });
}
