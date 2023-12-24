import { login, sendMsg, sendPrivateMsg } from './socket-emitters/emitters.js';
import { createSenderMsg } from './helper.js';
import { socket } from './socket-io-config.js';
import { activateListeners } from './socket-listeners/listeners.js';

// HTML elements
const msgBtn = document.querySelector('#emit-msg');
const msgInput = document.querySelector('#msg-text');
const signInBtn = document.querySelector('.sign-btn');
const exitBtn = document.querySelector('.exit-btn');
const usernameInput = document.querySelector('.username-text');
const container = document.querySelector('.container');
const menuBtn = document.querySelector('.menu-item');
const sideBarContainer = document.querySelector('.side-bar-container');
const usernameHolder = document.querySelector('.username-holder');

window.onload = () => {
    usernameInput.focus();
};

let onlineList = [];
let users = [];
activateListeners(socket, onlineList, users);
const userNameHeader = document.querySelectorAll('.user-name');

// For signing in
signInBtn.addEventListener('click', async evt => {
    evt.preventDefault();
    const usernameTxt = usernameInput.value.trim();

    const response = await fetch('/login', {
        body: JSON.stringify({
            username: usernameTxt,
        }),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (response.status === 201) {
        userNameHeader.forEach(elem => {
            elem.innerHTML = usernameTxt;
        });

        socket.connect();
        socket.auth = { username: usernameTxt };
        login(socket, onlineList, users);
    } else {
        const { error } = await response.json();
        console.log('Unable to login to chat: ', error);
    }
});

// For sending messages
msgBtn.addEventListener('click', evt => {
    evt.preventDefault();

    const msgText = msgInput.value;
    const activeChat = document.querySelector('.user-active > .name-header').innerHTML;

    //   Send the message
    const msgBoxes = document.querySelectorAll('.msg-box');

    let msgBox;
    let toUsername;

    msgBoxes.forEach(box => {
        if (!box.classList.contains('hide-box')) {
            msgBox = box;
            toUsername = box.getAttribute('data-user');
        }
    });

    if (toUsername) {
        const msgSpan = msgBox.querySelector('user-joined');
        if (msgSpan) {
            msgBox.removeChild(msgSpan);
        }
        createSenderMsg(msgBox, msgText);

        if (activeChat === 'Group') {
            sendMsg(socket, msgText);
        } else {
            console.log('Online list in PM: ', onlineList);
            const to = onlineList.find(user => user.username === activeChat);

            if (to) {
                console.log('PM to: ', to);
                sendPrivateMsg(socket, msgText, to);
            } else {
                // Store msg in index db
                console.log('User with id is offline: ', toUsername);
            }
        }

        msgInput.value = '';
        msgInput.focus();
    }
});

// For exiting application
exitBtn.addEventListener('click', () => {
    container.classList.remove('show-container');
    usernameHolder.classList.remove('hide-sign-in');
    usernameInput.value = '';
    usernameInput.focus();

    // Clear onlineList, msgBoxes and sidebar chats
    onlineList = [];
    users = [];

    const boxHolder = document.querySelector('.msg-box-holder');
    boxHolder.replaceChildren('');

    const sideBar = document.querySelector('.side-bar');
    sideBar.replaceChildren('');

    socket.disconnect();
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

window.addEventListener('beforeunload', evt => {
    evt.preventDefault();

    socket.disconnect();
});

menuBtn.addEventListener('click', evt => {
    sideBarContainer.classList.toggle('show-side-bar');
    const nameItem = document.querySelectorAll('.name-item');
    console.log('Name items: ', nameItem);
    nameItem.forEach(item => {
        item.classList.toggle('show-name-item');
    });
});
