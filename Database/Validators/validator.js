import messagesSchema from './messagesSchema.js';
import usersSchema from './usersSchema.js';

export const validationLevel = 'strict';
export const validationAction = 'error';
export const DBCollections = [usersSchema, messagesSchema];
