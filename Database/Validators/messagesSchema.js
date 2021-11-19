// Schema Imports

// Use the models to create dummy data
const dummyData = {};

const messagesSchema = {
  name: 'messages',
  dummyData,
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['type', 'number', 'fromUser', 'toUser', 'message'],
      properties: {
        type: {
          bsonType: 'string',
        },
        number: {
          bsonType: 'int',
        },
        fromUser: {
          bsonType: 'string',
        },
        toUser: {
          bsonType: 'string',
        },
        message: {
          bsonType: 'string',
        },
      },
    },
  },
};

export default messagesSchema;
