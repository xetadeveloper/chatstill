import { socket } from './socket-io-config.js';

const msgBoxHolder = document.querySelector('.msg-box-holder');
const sideBar = document.querySelector('.side-bar');

export function userJoined(msgBox, user, usersList, onlineList) {
  // If new user then create user
  // else change user to onine
  // console.log('User in userJoined: ', user.username);
  // console.log('usersList in userJoined: ', usersList);

  console.log('New User: ', user);

  const userFound = usersList.find(
    userItem => userItem.username === user.username
  );

  // console.log('UserFound from list: ', userFound);

  if (userFound) {
    // Existing user
    // console.log('Existing user: ', user.username);
    const onlineText = document.querySelector(
      `.name-item[data-user=${user.username}] .online-text`
    );

    const onlineCircle = document.querySelector(
      `.name-item[data-user=${user.username}] .online-circle`
    );

    onlineText.innerHTML = 'online';
    onlineCircle.classList.remove('offline');
  } else {
    // console.log('New user: ', user.username);
    sideBar.append(createNewUser(user.username, false, true));
    addMsgBox(user.username);
  }

  usersList.push(user);
  onlineList.push(user);
  msgBox.append(createJoinedMessage(user.username));
}

export function userLoggedIn(username) {
  // Add the group chat to the list of chats
  sideBar.prepend(createNewUser(username, true, true));
  addMsgBox(username, false);
  const nameItem = document.querySelector(`.name-item[data-group=${true}]`);
  nameItem.click();
}

export function showError(msg) {
  // Show the error message
  alert('Error: ', msg);
}

function showMsgBox(username) {
  const msgBoxes = document.querySelectorAll('.msg-box');
  msgBoxes.forEach(box => {
    if (!box.classList.contains('hide-box')) {
      box.classList.add('hide-box');
    }
  });

  msgBoxes.forEach(box => {
    if (box.getAttribute('data-user') === username) {
      box.classList.remove('hide-box');
    }
  });
}

export function getPMMessages(toUser) {}

function addMsgBox(username, hidden = true) {
  const msgBox = createMsgBox(username, !hidden);

  if (hidden) {
    msgBox.classList.add('hide-box');
  }

  msgBoxHolder.appendChild(msgBox);
}

// Creates HTMl elements
export function createSenderMsg(msgBox, msg, userTag) {
  let msgDiv = document.createElement('div');
  let msgSpan = document.createElement('span');
  let userSpan = document.createElement('h6');

  msgDiv.classList.add('send-msg');
  msgSpan.classList.add('msg-span');
  msgSpan.innerHTML = msg;

  if (userTag) {
    userSpan.innerHTML = userTag;
    msgDiv.append(userSpan);
  } else if (msgBox.getAttribute('data-group')) {
    userSpan.innerHTML = 'Me';
    msgDiv.append(userSpan);
  }

  msgDiv.appendChild(msgSpan);
  msgBox.appendChild(msgDiv);
  msgBox.scrollTop = msgBox.scrollHeight;
}

export function createRecipientMsg(msgBox, msg, userTag) {
  let msgDiv = document.createElement('div');
  let msgSpan = document.createElement('span');
  let userSpan = document.createElement('h6');

  msgDiv.classList.add('receive-msg');
  msgSpan.classList.add('msg-span');
  msgSpan.innerHTML = msg;

  if (userTag) {
    userSpan.innerHTML = userTag;
    msgDiv.append(userSpan);
  }

  msgDiv.appendChild(msgSpan);
  msgBox.appendChild(msgDiv);

  msgBox.scrollTop = msgBox.scrollHeight;
}

export function createNewUser(username, current = false, userOnline) {
  // <div class='name-item'>
  //   <h4 class='name-header'>No Gorup</h4>
  //   <div class='online'>
  //     <div class='online-status'>
  //       <div class='online-circle'></div>
  //       <h6 class='online-text'>online</h6>
  //     </div>
  //     <h6 class='new-msg'>1</h6>
  //   </div>
  // </div>

  // online-text
  const onlineText = document.createElement('h6');
  onlineText.classList.add('online-text');
  onlineText.innerHTML = userOnline ? 'online' : 'offline';

  // online-circle
  const onlineCircle = document.createElement('div');
  onlineCircle.classList.add('online-circle');
  if (!userOnline) {
    onlineCircle.classList.add('offline');
  }

  // online-status
  const onlineStatus = document.createElement('div');
  onlineStatus.classList.add('online-status');
  onlineStatus.append(onlineCircle);
  onlineStatus.append(onlineText);

  // new-msg
  const newMsg = document.createElement('h6');
  newMsg.classList.add('new-msg');
  newMsg.innerHTML = 0;

  // online
  const online = document.createElement('div');
  online.classList.add('online');
  online.append(onlineStatus);
  online.append(newMsg);

  // name-header
  const nameHeader = document.createElement('h4');
  nameHeader.classList.add('name-header');
  nameHeader.classList.add('user-name');
  nameHeader.innerHTML = current ? `Group` : username;

  // name-item
  const nameItem = document.createElement('div');
  nameItem.classList.add('name-item');
  nameItem.append(nameHeader);
  nameItem.append(online);
  if (current) {
    nameItem.setAttribute('data-group', true);
    nameItem.classList.add('user-active');
  } else {
    nameItem.setAttribute('data-user', username);
  }

  nameItem.addEventListener('click', evt => {
    console.log('username name item: ', username);
    showMsgBox(username);
    const groupMsgs = nameItem.getAttribute('data-group');
    const msgBox = document.querySelector(`.msg-box[data-user=${username}]`);

    if (!msgBox.getAttribute('data-msg-received')) {
      // Get all messages for this chat first from server
      socket.emit(
        groupMsgs ? 'get-group-messages' : 'get-pm-messages',
        username,
        msgList => {
          console.log('Gotten msglist: ', msgList);
          msgBox.setAttribute('data-msg-received', true);
          if (msgList.length) {
            // const msgSpan = msgBox.querySelector('user-joined');
            // if (msgSpan) {
            //   msgBox.removeChild(msgSpan);
            // }

            msgList.sort((a, b) => a.number - b.number);
            msgList.forEach(msgItem => {
              if (msgItem.toUser === username) {
                createSenderMsg(msgBox, msgItem.message);
              } else if (
                msgItem.toUser === 'group' &&
                msgItem.fromUser === socket.auth.username
              ) {
                createSenderMsg(msgBox, msgItem.message, 'Me');
              } else if (
                msgItem.toUser === 'group' &&
                !(msgItem.fromUser === socket.auth.username)
              ) {
                console.log('Adding gorup user msg from another user');
                createRecipientMsg(msgBox, msgItem.message, msgItem.fromUser);
              } else {
                createRecipientMsg(msgBox, msgItem.message);
              }
            });
          } else {
            // Show send a message text in msg box
            msgBox.append(
              createJoinedMessage(null, `Send a message to ${username}`)
            );
          }
        }
      );
    }

    // Get current active chat
    const activeUser = document.querySelector('.user-active');
    if (activeUser) {
      activeUser.classList.remove('user-active');
    }

    // Make this the active chat
    nameItem.classList.add('user-active');

    // Remove the new msg tag
    const newMsg = nameItem.querySelector('.new-msg');
    newMsg.classList.remove('show-new-msg');
  });

  return nameItem;
}

export function createJoinedMessage(username, msg) {
  let msgDiv = document.createElement('div');
  let msgSpan = document.createElement('h6');

  msgDiv.classList.add('user-joined');
  msgSpan.classList.add('msg-span');
  if (msg) {
    msgSpan.innerHTML = msg;
  } else {
    msgSpan.innerHTML = `${username} joined now`;
  }

  msgDiv.appendChild(msgSpan);

  return msgDiv;
}

export function createUsersList(users) {
  const list = users.map(user => {
    addMsgBox(user.username);
    return createNewUser(user.username, false, user.online);
  });

  sideBar.replaceChildren(...list);
}

export function createMsgBox(username, current) {
  const msgBox = document.createElement('div');
  msgBox.classList.add('msg-box');
  msgBox.setAttribute('data-user', username);
  if (current) {
    msgBox.setAttribute('data-group', true);
  }

  return msgBox;
}
