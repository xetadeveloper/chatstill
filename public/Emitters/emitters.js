import { createUsersList, showError, userLoggedIn } from '../helper.js';

const container = document.querySelector('.container');
const usernameHolder = document.querySelector('.username-holder');

export function sendMsg(socket, msg) {
  socket.emit('chat-message', msg);
  console.log('Sent a message...', msg);
}

export function sendPrivateMsg(socket, msg, to) {
  console.log('Sending message to', to);
  socket.emit('private-message', msg, to);
  console.log('Sent a private message...', msg);
}

export function login(socket, usersList) {
  socket.emit('login', ({ ok, onlineList }) => {
    if (ok) {
      console.log('Login successful...');
      container.classList.add('show-container');
      usernameHolder.classList.add('hide-sign-in');

      console.log('Online list received on login: ', onlineList);
      // Initial list
      usersList.push(...onlineList);
      createUsersList(onlineList.map(user => user.username));
      userLoggedIn(socket.auth.username);
    } else {
      // Bad username
      console.log('Login Failed...');
      showError(response.error);
    }
  });
}
