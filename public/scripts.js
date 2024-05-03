// const userName = prompt("What is your username");
// const password = prompt("What is your password");

// connect to namespace
const socket = io("http://localhost:8000");

// Remember it this happens onces for connection
socket.on("connection", () => {
  console.log("Connected!");
  socket.emit("clientConnect"); // Ping - hey I am here
});

socket.on("welcome", (data) => {
  console.log(data);
});

const nameSpaceSockets = [];
const listeners = {
  nsChange: [],
  messageToRoom: [],
};

//a global variable we can update when the user clicks on a namespace
// we will use it to broadcast across the app (redux would be great here...)
let selectedNsId = 0;

//add a submit handler for our form
document.querySelector("#message-form").addEventListener("submit", (e) => {
  // keep the browser from submitting, prevent the browser from moving forward
  e.preventDefault();
  // grab the value from the input box
  const newMessage = document.querySelector("#user-message").value;
  console.log(newMessage, selectedNsId);
  nameSpaceSockets[selectedNsId].emit("newMessageToRoom", {
    newMessage: newMessage,
    date: Date.now(),
    avatar: "https://via.placeholder.com/30",
    selectedNsId, // Need to confirm that the user is part of the namespace
    // userName: userName,
  });
  document.querySelector("#user-message").value = "";
});

// This managers all listeners
// If the listenrs namespace change is empty (no namespace id added to it)
// Then that means that the namespace hasv't had the nsChange added to it
// Then add the namespaceNameChange event listener on that namespace
// This method add the namespaceNameChange event listener to the namespaces
// This is to prevent the listeners from being added too many times
const addListeners = (nsId) => {
  if (!listeners.nsChange[nsId]) {
    nameSpaceSockets[nsId].on("namespaceNameChange", (data) => {
      console.log("Namespace Changed!");
      console.log(data);
    });
    listeners.nsChange[nsId] = true;
  }
  if (!listeners.messageToRoom[nsId]) {
    nameSpaceSockets[nsId].on("messageToRoom", (messageObj) => {
      console.log(messageObj);
      document.querySelector("#messages").innerHTML +=
        buildMessageHtml(messageObj);
    });
    listeners.messageToRoom[nsId] = true;
  }
};

// Listen for the nsList event from the server which gives us the namespaces
socket.on("nsList", (namespaceData) => {
  const lastNs = localStorage.getItem("lastNs");
  const namespaceDiv = document.querySelector(".namespaces");
  namespaceDiv.innerHTML = "";

  // Looping through all the namespaces
  // Go through this again and make sure you understand it
  namespaceData.forEach((ns) => {
    namespaceDiv.innerHTML += `<div class="namespace" ns="${ns.endpoint}"><img src="${ns.image}"></div>`;

    //Initialise thisNsSocket as its index in nameSpaceSockets
    //If the connection is new, this will be null
    //If the connection has already been established, it will reconnect and remain in its spot
    // let thisNsSocket = nameSpaceSockets[ns.id];

    // If there a no namespaces, connect to all namepaces
    if (!nameSpaceSockets[ns.id]) {
      //There is no socket at this nsId. So make a new connection!
      //join this namespace with io()
      nameSpaceSockets[ns.id] = io(`http://localhost:8000${ns.endpoint}`);
    }
    addListeners(ns.id);
  });

  // For every namespace element, add a click event, if clicked grab the it's namespace attribute,
  // Send it to the namespace method
  Array.from(document.getElementsByClassName("namespace")).forEach(
    (element) => {
      element.addEventListener("click", (e) => {
        joinNamespace(element, namespaceData);
      });
    }
  );

  // If lastNs is set, grab the last namespace

  // Enter the first namespace when the page loads
  joinNamespace(document.getElementsByClassName("namespace")[0], namespaceData);
});

const buildMessageHtml = (messageObj) => {
  // Convert timestamp to Date object if necessary
  const messageDate = new Date(messageObj.date);

  // Format the date as a local string
  const formattedDate = messageDate.toLocaleString();

  // Construct and return the HTML string
  return `<li>
            <div class="user-image">
                <img src="${messageObj.avatar}" />
            </div>
            <div class="user-message">
                <div class="user-name-time">${messageObj.userName}<span>${formattedDate}</span></div>
                <div class="message-text">${messageObj.newMessage}</div>
            </div>
          </li>`;
};
