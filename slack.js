const express = require("express");
const app = express();
const socketio = require("socket.io");
const namespaces = require("./data/namespaces");
const Room = require("./classes/Room");
const { log } = require("console");

app.use(express.static(__dirname + "/public"));

const expressServer = app.listen(9000);
const io = socketio(expressServer, {
  cors: {
    origin: "*",
  },
});
// This code is good pratice
// app.set("io", io);

// Client submits and namespace name change
// change namespace middleware
app.get("/change-namespace", (req, res) => {
  //update the namespace
  namespaces[0].addRoom(new Room(0, "Deleted Books", 0));

  //let everyone know in THIS namespace , that it changed
  io.of(namespaces[0].endpoint).emit("namespaceNameChange", namespaces[0]);
  res.json(namespaces[0]);
});

io.on("connection", (socket) => {
  socket.emit("welcome", "Welcome to the socket server!");
  socket.on("clientConnect", (data) => {
    console.log(socket.id, "has connected");
  });
  socket.emit("nsList", namespaces);
});

// Loop through the namespaces and add connection events on them
// doing it dynamically
namespaces.forEach((namespace) => {
  //The endpoint /Wiki /Linux
  io.of(namespace.endpoint).on("connection", (socket) => {
    socket.on("joinRoom", async (roomTitle, ackCallBack) => {
      // console.log(`${socket.id} has connected to ${namespace.endpoint}`);

      // Need to fetch the history

      //Leave all rooms,
      // has a list of previously joined rooms without/before the current joined room
      // that's why it should be behind the join room method
      const rooms = socket.rooms;
      console.log(rooms);

      // Leave all rooms expect the personal room
      let i = 0;
      rooms.forEach((room) => {
        // we dont want to leave the clients personal room, which is the first room 0
        const personalRoom = 0;
        if (i !== 0) {
          socket.leave(room);
        }
        i++;
      });

      // Join the room
      // NOTE - roomTitle is coming from the client which is not safe!
      // Auth, to make sure user has the right to join that room

      socket.join(roomTitle);
      const sockets = await io
        .of(namespace.endpoint)
        .in(roomTitle)
        .fetchSockets();
      const usersCount = sockets.length;
      // Send back an acknowledgement message
      ackCallBack({
        numUsers: usersCount,
        message: "Acknowledged!",
      });
    });

    socket.on("newMessageToRoom", (messageObj) => {
      console.log(messageObj);
      //broadcast this to all the connected clients... this room only!
      //how can we find out what room THIS socket is in?
      const rooms = socket.rooms;
      const currentRoom = [...rooms][1]; //This is a set not an array so you need to spread it lol
      //send out this messageObj to everyone including the sender
      io.of(namespace.endpoint)
        .in(currentRoom)
        .emit("messageToRoom", messageObj);
      // Add this message to this rooms history
      const thisNs = namespaces[messageObj.selectedNsId];
      const thisRoom = thisNs.rooms.find(
        (room) => room.roomTitle === currentRoom
      );
      console.log(thisRoom);
      thisRoom.addMessage(messageObj);
    });
  });
});
