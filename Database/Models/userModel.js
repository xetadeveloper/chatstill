import bcrypt from 'bcrypt';
import mongoTypes from 'mongodb';
const { Double } = mongoTypes;
import { removeNull } from '../../Utils/utility.js';

export default class User {
  constructor(user) {
    this.username = '';
    this.password = '';
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.storageUsed = 0;
    this.profilePic = {};
    this.pictures = [];
    this.preferences = {};

    if (user) {
      Object.assign(this, user);
    }
  }

  async hashPassword() {
    const SALT_ROUNDS = 10;

    try {
      this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
      return this;
    } catch (err) {
      console.log('Error Occured In Hashing User Password: ', err.stack);
      throw err;
    }
  }

  removeEmptyFields(clearAll) {
    return removeNull.call(this, clearAll);
  }

  convertToMongo() {
    const mongoTypes = {
      username: this.username,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      profilePic: this.profilePic,
      storageUsed: this.storageUsed ? Double(this.storageUsed) : null,
      pictures: this.pictures,
      preferences: this.preferences,
    };

    for (let prop in mongoTypes) {
      if (
        !mongoTypes[prop] ||
        (typeof mongoTypes[prop] === 'object' &&
          Object.keys(mongoTypes[prop]).indexOf('value') > -1 &&
          !mongoTypes[prop].value)
      ) {
        delete mongoTypes[prop];
      }
    }

    return mongoTypes;
  }
}

