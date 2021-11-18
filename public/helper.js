const msgBoxHolder = document.querySelector('.msg-box-holder');
const sideBar = document.querySelector('.side-bar');

export function userJoined(msgBox, username) {
  msgBox.append(createJoinedMessage(username));
  sideBar.append(createNewUser(username));
  addMsgBox(username);
}

export function userLoggedIn(username) {
  sideBar.prepend(createNewUser(username, true));
  addMsgBox(username, false);
}

export function showError(msg) {
  // Show the error message
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

function addMsgBox(username, hidden = true) {
  const msgBox = createMsgBox(username);

  if (hidden) {
    msgBox.classList.add('hide-box');
  }

  msgBoxHolder.appendChild(msgBox);
}

// Creates HTMl elements
export function createSenderMsg(msgBox, msg) {
  let msgDiv = document.createElement('div');
  let msgSpan = document.createElement('span');

  msgDiv.classList.add('send-msg');
  msgSpan.classList.add('msg-span');
  msgSpan.innerHTML = msg;

  msgDiv.appendChild(msgSpan);
  msgBox.appendChild(msgDiv);
}

export function createRecipientMsg(msgBox, msg) {
  let msgDiv = document.createElement('div');
  let msgSpan = document.createElement('span');

  msgDiv.classList.add('receive-msg');
  msgSpan.classList.add('msg-span');
  msgSpan.innerHTML = msg;

  msgDiv.appendChild(msgSpan);
  msgBox.appendChild(msgDiv);
}

export function createNewUser(username, current = false) {
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
  onlineText.innerHTML = 'online';

  // online-circle
  const onlineCircle = document.createElement('div');
  onlineCircle.classList.add('online-circle');

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
    showMsgBox(username);

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
    addMsgBox(user);
    return createNewUser(user);
  });

  sideBar.replaceChildren(...list);
}

export function createMsgBox(username) {
  const msgBox = document.createElement('div');
  msgBox.classList.add('msg-box');
  msgBox.setAttribute('data-user', username);

  return msgBox;
}
