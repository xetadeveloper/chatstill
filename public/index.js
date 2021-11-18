import { activateListeners } from './Listeners/listeners.js';
import { login, sendMsg, sendPrivateMsg } from './Emitters/emitters.js';
import { createSenderMsg } from './helper.js';

const socket = io({
  autoConnect: false,
});

const msgBtn = document.querySelector('#emit-msg');
const msgInput = document.querySelector('#msg-text');
const signInBtn = document.querySelector('.sign-btn');
const usernameInput = document.querySelector('.username-text');

window.onload = () => {
  usernameInput.focus();
};

const onlineList = [];
activateListeners(socket, onlineList);
const userNameHeader = document.querySelectorAll('.user-name');

// For signing in
signInBtn.addEventListener('click', evt => {
  evt.preventDefault();
  const usernameTxt = usernameInput.value;

  userNameHeader.forEach(elem => {
    elem.innerHTML = usernameTxt;
  });

  socket.connect();
  socket.auth = { username: usernameTxt };
  login(socket, onlineList);
});

// For sending messages
msgBtn.addEventListener('click', evt => {
  evt.preventDefault();

  const msgText = msgInput.value;
  const activeChat = document.querySelector(
    '.user-active > .name-header'
  ).innerHTML;

  //   Send the message
  const msgBoxes = document.querySelectorAll('.msg-box');
  console.log('Length of msgboxes: ', msgBoxes.length);
  let msgBox;
  msgBoxes.forEach(box => {
    if (!box.classList.contains('hide-box')) {
      msgBox = box;
    }
  });


  if (msgBox) {
    createSenderMsg(msgBox, msgText);
    if (activeChat === 'Group') {
      sendMsg(socket, msgText);
    } else {
      console.log('Online list: ', onlineList);
      const to = onlineList.find(user => user.username === activeChat);
      sendPrivateMsg(socket, msgText, to);
    }

    msgInput.value = '';
    msgInput.focus();
  }
});

// For the enter key
msgInput.addEventListener('keyup', evt => {
  if (evt.keyCode === 13 && msgInput.value) {
    evt.preventDefault();
    msgBtn.click();
  }
});

usernameInput.addEventListener('keyup', evt => {
  if (evt.keyCode === 13 && usernameInput.value) {
    evt.preventDefault();
    signInBtn.click();
  }
});
