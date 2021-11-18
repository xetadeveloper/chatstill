import {
  createJoinedMessage,
  createRecipientMsg,
  userJoined,
} from '../helper.js';

export function activateListeners(socket, onlineList) {
  socket.on('connect', () => {
    const groupChat = document.querySelector(`.name-item[data-group=${true}]`);
    console.log('My socket id:  ', socket.id);

    if (groupChat) {
      const groupMsgBox = document.querySelector(
        `.msg-box[data-user=${socket.auth.username}]`
      );

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

    groupMsgBox.append(
      createJoinedMessage(null, 'Disconnected from group chat')
    );

    const onlineText = groupChat.querySelector('.online-text');
    const onlineCircle = groupChat.querySelector('.online-circle');
    onlineText.innerHTML = 'offline';
    onlineCircle.classList.add('offline');

    console.log('Disconnected: ', socket.auth.username);
  });

  socket.on('user-joined', (username, socketID) => {
    const groupMsgBox = document.querySelector(
      `.msg-box[data-user=${socket.auth.username}]`
    );
    onlineList.push({ username, socketID });
    console.log('New online list: ', onlineList);
    userJoined(groupMsgBox, username);
  });

  socket.on('user-left', (username, socketID, onlineList) => {
    console.log('User left: : ', username);
    const userBox = document.querySelector(`.msg-box[data-user=${username}]`);
    const userItem = document.querySelector(
      `.name-item[data-user=${username}]`
    );

    const sideBar = document.querySelector('.side-bar');
    const msgBoxHolder = document.querySelector('.msg-box-holder');

    msgBoxHolder.removeChild(userBox);
    sideBar.removeChild(userItem);

    const groupMsgBox = document.querySelector(
      `.msg-box[data-user=${socket.auth.username}]`
    );

    groupMsgBox.append(
      createJoinedMessage(null, `${username} left group chat`)
    );

    onlineList.forEach((user, index) => {
      if (user.socketID === socketID) {
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

  socket.on('private-message', (msg, from) => {
    console.log('Received private message: ', msg);

    const username = from.username;
    const activeChats = document.querySelectorAll('.name-item');

    activeChats.forEach(chat => {
      if (chat.querySelector('.name-header').innerHTML === username) {
        addMsgCount(chat);
      }
    });

    const msgBox = document.querySelector(`.msg-box[data-user=${username}]`);
    createRecipientMsg(msgBox, msg);
  });
}

function addMsgCount(chat) {
  const newMsg = chat.querySelector('.new-msg');

  if (newMsg.classList.contains('show-new-msg')) {
    const msgCount = Number(newMsg.innerHTMl) + 1;
    newMsg.innerHTML = msgCount;
  } else {
    newMsg.classList.add('show-new-msg');
    newMsg.innerHTML = 1;
  }
}
