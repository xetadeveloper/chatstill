import {
  createJoinedMessage,
  createRecipientMsg,
  userJoined,
} from '../helper.js';

export function activateListeners(socket, onlineList, usersList) {
  socket.on('connect', () => {
    const groupChat = document.querySelector(`.name-item[data-group=${true}]`);
    const groupMsgBox = document.querySelector(
      `.msg-box[data-user=${socket.auth.username}]`
    );

    // console.log('My socket id:  ', socket.id);
    // console.log('groupchat: ', groupChat);

    if (groupChat) {
      groupMsgBox.append(
        createJoinedMessage(null, 'Reconnected to group chat')
      );
      const onlineText = groupChat.querySelector('.online-text');
      const onlineCircle = groupChat.querySelector('.online-circle');
      onlineText.innerHTML = 'online';
      onlineCircle.classList.remove('offline');
    }
  });

  socket.on('disconnect', () => {
    const groupMsgBox = document.querySelector(
      `.msg-box[data-user=${socket.auth.username}]`
    );
    const groupChat = document.querySelector(`.name-item[data-group=${true}]`);

    if (groupMsgBox) {
      groupMsgBox.append(
        createJoinedMessage(null, 'Disconnected from group chat')
      );

      const onlineText = groupChat.querySelector('.online-text');
      const onlineCircle = groupChat.querySelector('.online-circle');
      onlineText.innerHTML = 'offline';
      onlineCircle.classList.add('offline');
    }

    // console.log('Disconnected: ', socket.auth.username);
  });

  socket.on('db-error', error => {
    // Handle error
    console.log('Error on server: ', error);
  });

  socket.on('user-joined', user => {
    const groupMsgBox = document.querySelector(`.msg-box[data-group=${true}]`);

    onlineList.push(user);
    // console.log('New online list: ', onlineList);
    userJoined(groupMsgBox, user, usersList);
  });

  socket.on('user-left', ({ username, _id }) => {
    // console.log('User left: : ', username);
    const onlineText = document.querySelector(
      `.name-item[data-user=${username}] .online-text`
    );

    const onlineCircle = document.querySelector(
      `.name-item[data-user=${username}] .online-circle`
    );

    const groupMsgBox = document.querySelector(`.msg-box[data-group=${true}]`);

    onlineText.innerHTML = 'offline';
    onlineCircle.classList.add('offline');
    groupMsgBox.append(createJoinedMessage(null, `${username} left chat`));

    onlineList.forEach((user, index) => {
      if (user._id === _id) {
        // remove user from list
        onlineList.splice(index, 1);
        console.log('Online List: ', onlineList);
      }
    });
  });

  socket.on('chat-message', msg => {
    const groupMsgBox = document.querySelector(
      `.msg-box[data-user=${socket.auth.username}]`
    );

    const groupChat = document.querySelector(`.name-item[data-group=${true}]`);

    addMsgCount(groupChat);

    createRecipientMsg(groupMsgBox, msg);
  });

  socket.on('private-message', (msg, fromUser) => {
    console.log('Received private message: ', msg);

    const activeChats = document.querySelectorAll('.name-item');

    activeChats.forEach(chat => {
      if (chat.querySelector('.name-header').innerHTML === fromUser) {
        addMsgCount(chat);
      }
    });

    const msgBox = document.querySelector(`.msg-box[data-user=${fromUser}]`);
    createRecipientMsg(msgBox, msg);
  });

  socket.on('pm-offline', (to, msg) => {
    console.log('User with id is offline: ', to);

    // Store data in local storage or indexedDB and resend when user is online
    // Delegate this to a worker thread to keep on checking if user has come baclk online
  });
}

function addMsgCount(chat) {
  const newMsg = chat.querySelector('.new-msg');

  if (newMsg.classList.contains('show-new-msg')) {
    const msgCount = Number.parseInt(newMsg.innerHTML);
    newMsg.innerHTML = 1 + msgCount;
  } else {
    newMsg.classList.add('show-new-msg');
    newMsg.innerHTML = 1;
  }
}
