import mongo from 'mongodb';
import {
  DBCollections,
  validationAction,
  validationLevel,
} from './Validators/validator.js';

const { MongoClient } = mongo;
let isConnected = false;
const productionMode = process.env.NODE_ENV == 'production';
const testMode = process.env.NODE_ENV === 'test';

const defaultDB = testMode ? process.env.testDB : process.env.defaultDB;

const dbUrl = productionMode
  ? process.env.prodDBUrl
  : testMode
  ? process.env.testDBUrl
  : process.env.devDBUrl;
// console.log('DBUrl: ', dbUrl);
console.log('DBName: ', defaultDB);

const DBPool = {};
let client;

async function connectDB(dbName = defaultDB) {
  if (!client) {
    client = new MongoClient(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    try {
      await client.connect();
    } catch (err) {
      // console.log('Error Occured: ', err.message);
      throw err;
    }
  }

  const db = client.db(dbName);
  // // console.log('Db that was connected: ', db)
  if (!(await checkDBExists(db, dbName))) {
    console.log(`DB ${dbName} does not exist`);
    await configureDefaultDB(
      db,
      DBCollections,
      validationLevel,
      validationAction
    );
    console.log(`Database ${dbName} created`);
  }

  // Add to database pool
  DBPool[dbName] = db;
  isConnected = true;
  console.log('DB Connected now!');

  return db;
}

async function checkDBExists(db, dbName) {
  let exists = false;
  await db
    .admin()
    .listDatabases()
    .then(list => {
      // // console.log('List: ', list);
      list.databases.forEach(database => {
        if (database.name === dbName) {
          exists = true;
        }
      });
    });

  return exists;
}

async function configureDefaultDB(
  db,
  collections,
  validationLevel,
  validationAction
) {
  try {
    // Setup DB for first time use
    collections.forEach(coll => {
      console.log(`Creating collection ${coll.name}...`);

      db.createCollection(coll.name, {
        validator: coll.validator,
        validationAction,
        validationLevel,
      })
        .then(createdColl => {
          // console.log(`Collection ${coll.name} created...`);
          // if (!productionMode) {
          //   // Create dummy data
          //   createdColl.insertMany(coll.dummyData)
          // }
        })
        .catch(err => {
          console.log('Error Occured In Creating Collections: ', err);
          throw err;
        });
    });
  } catch (err) {
    // console.log('Error Occured In Overall Creation: ', err);
    throw err;
  }
}

/**For configuring several databases
 */
async function configureAllDB() {}

/** This function gets the database instance if found in the pool or creates a new connection and returns that
 * @param {String} dbName Name of the database to get the instance
 * @returns a mongoDB database instance
 */
export async function getDBInstance(dbName = defaultDB) {
  // // console.log('DBName to get intance: ', dbName);
  if (DBPool[dbName]) {
    // // console.log('DB already connected..');
    return DBPool[dbName];
  } else {
    try {
      console.log('DB not connected. Connecting....');
      return await connectDB(dbName);
    } catch (err) {
      // console.log('Error occured in gettingDBInstance: ', err);
      throw err;
    }
  }
}

export function checkIfConnected() {
  return isConnected;
}

export function closeClientInstance() {
  if (client) {
    try {
      client.close();
      console.log('Client has been closed...');
      isConnected = false;
    } catch (err) {
      throw err;
    }
  } else {
    console.log('Client was not initialized...');
  }
}
