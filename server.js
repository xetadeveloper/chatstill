import './config.js';
import express from 'express';
import path from 'path';
import session from 'express-session';
import mongoConnect from 'connect-mongodb-session';
import { v4 } from 'uuid';
import { createServer } from 'http';
import startWebsocket from './socketio.js';
import { getDBInstance } from './Database/mongoDB.js';

const app = express();
const httpServer = createServer(app);

httpServer.on('connect', parent => {
  console.log('Connection to HTTP occured: ', parent);
});

httpServer.on('upgrade', socket => {
  // console.log('Connection upgrade...');
});

getDBInstance();

const productionMode = process.env.NODE_ENV == 'production';
const dbUrl = productionMode
  ? process.env.prodDBUrl
  : testMode
  ? process.env.testDBUrl
  : process.env.devDBUrl;

const MongoDBStore = mongoConnect(session);
export const store = new MongoDBStore({
  uri: dbUrl,
  collection: 'chatbotsession',
  expires: 1000 * 60 * 60 * 24 * 30, // 30 days in milliseconds
  connectionOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
  },
});

store.on('error', err => {
  console.log('An error occured connecting to mongodb session store: ', err);
});

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    rolling: true,
    secret: 'myveryownsessionsecret',
    name: 'chat-session',
    genid: () => v4(),
    store: store,
  })
);

// Middleware
app.use(express.static(path.join(path.resolve(), 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Normal HTTP
app.post('/login', async (req, res) => {
  const { username } = req.body;

  if (username.toLowerCase() === 'group') {
    res.status(400).json({ error: 'Cannot use group as username' });
    return;
  }

  try {
    const db = await getDBInstance();
    const usersCol = db.collection('users');

    const user = await usersCol.findOne({ username: username });
    if (user) {
      // If existing user, then update the user sessionID and return 201
      const { acknowledged, matchedCount } = await usersCol.updateOne(
        { username: username },
        { $set: { sessionID: req.sessionID, online: true } }
      );

      if (acknowledged && matchedCount) {
        req.session.username = username;
        res.status(201).json({ login: true });
      } else {
        res.status(500).json({ error: 'error in creating user' });
      }
    } else {
      // If new user with unique name, create user info in DB and return 201
      const { acknowledged } = await usersCol.insertOne({
        username: username,
        sessionID: req.sessionID,
        messages: [],
        online: true,
      });

      if (acknowledged) {
        req.session.username = username;
        res.status(201).json({ login: true });
      } else {
        res.status(500).json({ error: 'error in creating user' });
      }
    }
  } catch (error) {
    console.log('Error occured in login: ', error);
    res.status(500).json({ error: error });
  }
});

// Handling errors
app.use((err, req, res, next) => {
  console.log('Error occured: ', err);
  res.send('Error Occured');
});

httpServer.listen(process.env.PORT || 5000, () => {
  console.log('Server started on port 5000....');
});

// // Websocket Connections
startWebsocket(httpServer);
