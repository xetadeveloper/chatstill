import { createUsersList, showError, userLoggedIn } from '../helper.js';

const container = document.querySelector('.container');
const usernameHolder = document.querySelector('.username-holder');

export function sendMsg(socket, msg) {
  socket.emit('chat-message', msg);
  // console.log('Sent a message...', msg);
}

export function sendPrivateMsg(socket, msg, to) {
  socket.emit('private-message', msg, to);
  // console.log('Sending message to', to);
  // console.log('Sent a private message...', msg);
}

export function login(socket, onlineList, users) {
  socket.emit('login', ({ ok, userOnlineList, usersList }) => {
    // console.log('Online list received on login: ', userOnlineList);
    // console.log('usersList received: ', usersList);

    if (ok) {
      // console.log('Login successful...');
      container.classList.add('show-container');
      usernameHolder.classList.add('hide-sign-in');

      // Initial list on login
      onlineList.push(...userOnlineList);
      users.push(...usersList);

      createUsersList(users);
      userLoggedIn(socket.auth.username);
    } else {
      // Bad username
      console.log('Login Failed...');
      showError(response.error);
    }
  });
}
