const Namespace = require("../classes/Namespaces");
const Room = require("../classes/Room");

const wikiNs = new Namespace(
  0,
  "Wikipedia",
  "https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/103px-Wikipedia-logo-v2.svg.png",
  "/wiki"
);

const mozNs = new Namespace(
  1,
  "Mozilla",
  "https://www.mozilla.org/media/img/logos/firefox/logo-quantum.9c5e96634f92.png",
  "/mozilla"
);

const linuxNs = new Namespace(
  2,
  "Linus",
  "https://upload.wikimedia.org/wikipedia/commons/a/af/Tux.png",
  "/linux"
);

wikiNs.addRoom(new Room(0, "Room-1", 0));
wikiNs.addRoom(new Room(1, "Room-2", 0, true));

mozNs.addRoom(new Room(0, "Room-1", 1));

linuxNs.addRoom(new Room(0, "Room-1", 2));
linuxNs.addRoom(new Room(1, "Room-2", 2));

const namespaces = [wikiNs, mozNs, linuxNs];

module.exports = namespaces;
