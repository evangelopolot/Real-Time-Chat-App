// Get the namespaces and outputs the rooms of the namespace
// Dont ask the server for fresh info on namespaces, it's giving HTTP
const joinNamespace = (element, namespaceData) => {
  const nsEndpoint = element.getAttribute("ns");
  console.log(nsEndpoint);

  // Find the one with an endpoint matching the one the user just clicked on
  const clickedNamespace = namespaceData.find(
    (row) => row.endpoint === nsEndpoint
  );
  // global so we can submit new message to the right place
  selectedNsId = clickedNamespace.id;
  const rooms = clickedNamespace.rooms;

  // get the room-list div
  let roomList = document.querySelector(".room-list");
  //clear it out
  roomList.innerHTML = "";

  // Do the uu stuff first
  // init firstRoom var
  let firstRoom;

  //loop through each room, and add it to the DOM
  rooms.forEach((room, iter) => {
    if (iter == 0) {
      firstRoom = room.roomTitle;
    }
    roomList.innerHTML += `<li class="room" namespaceId=${
      room.namespaceId
    }><span class="fa-solid fa-${room.privateRoom ? "lock" : "globe"}"></span>${
      room.roomTitle
    }</li>`;
  });

  //init join first room
  joinRoom(firstRoom, clickedNamespace.id);

  // add a click listener to each room so the client can tell the server it wants to join
  const roomNodes = document.querySelectorAll(".room");
  Array.from(roomNodes).forEach((elem) => {
    elem.addEventListener("click", (e) => {
      console.log("Someone clicked on: " + e.target.innerText);
      const roomTitle = e.target.innerText;
      const namespaceId = elem.getAttribute("namespaceId");
      joinRoom(roomTitle, namespaceId);
    });
  });

  localStorage.setItem("lastNs", nsEndpoint);
};
