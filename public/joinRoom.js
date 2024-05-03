const joinRoom = async (roomTitle, namespaceId) => {
  console.log(
    "The name of the room: " + roomTitle + " the rooms id " + namespaceId
  );
  const ackResqObj = await nameSpaceSockets[namespaceId].emitWithAck(
    "joinRoom",
    roomTitle
  );
  console.log("This is the acknowledgement: " + ackResqObj);
  document.querySelector(
    ".curr-room-num-users"
  ).innerHTML = `${ackResqObj.numUsers}<span class="fa-solid fa-user"></span>`;
  document.querySelector(".curr-room-text").innerHTML = roomTitle;
};
