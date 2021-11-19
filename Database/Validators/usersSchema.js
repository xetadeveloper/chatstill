// Schema Imports

// Use the models to create dummy data
const dummyData = {};

const usersSchema = {
  name: 'users',
  dummyData,
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'sessionID', 'messages'],
      properties: {
        username: {
          bsonType: 'string',
        },
        sessionID: {
          bsonType: 'string',
        },
        messages: {
          bsonType: 'array',
          items: {
            bsonType: 'string',
          },
        },
      },
    },
  },
};

export default usersSchema;
