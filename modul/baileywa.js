const {
  default: makeWASocket,
  DisconnectReason,
  makeInMemoryStore,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const { sendIp } = require("./ipadress");
const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});
const fs = require("fs");
let sock;

async function connectToWhatsApp() {
  console.log("Connecting to WhatsApp...");
  const { state, saveCreds } = await useMultiFileAuthState("baileys_auth_info");

  sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
  });
  store.bind(sock.ev);
  sock.multi = true;

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      let reason = new Boom(lastDisconnect.error).output.statusCode;
      if (reason === DisconnectReason.badSession) {
        console.log(`Bad Session File, Please Delete session and Scan Again`);
        sock.logout();
      } else if (reason === DisconnectReason.connectionClosed) {
        console.log("Connection closed, reconnecting....");
        connectToWhatsApp();
      } else if (reason === DisconnectReason.connectionLost) {
        console.log("Connection Lost from Server, reconnecting...");
        connectToWhatsApp();
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log(
          "Connection Replaced, Another New Session Opened, Please Close Current Session First"
        );
        sock.logout();
      } else if (reason === DisconnectReason.loggedOut) {
        console.log(`Device Logged Out, Please Delete session and Scan Again.`);
        sock.logout();
      } else if (reason === DisconnectReason.restartRequired) {
        console.log("Restart Required, Restarting...");
        connectToWhatsApp();
      } else if (reason === DisconnectReason.timedOut) {
        console.log("Connection TimedOut, Reconnecting...");
        connectToWhatsApp();
      } else {
        sock.end(`Unknown DisconnectReason: ${reason}|${lastDisconnect.error}`);
      }
    } else if (connection === "open") {
      console.log("opened connection");
      sendIp(sock);
    }
  });
  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    console.log("Type:", type);

    if (type === "notify" && messages && messages.length > 0) {
      const message = messages[0];
      //   saveMessageToJson(message);
      if (!message.key.fromMe) {
        const pesan = message.message.extendedTextMessage.text;
        const noWa = message.key.remoteJid;
        if (pesan) {
          const text = pesan;
          console.log("______________");
          console.log("Nomor Telepon:", noWa);
          console.log("Pesan:", text);

          await sock.readMessages([message.key]);
          if (text === "ping") {
            await sock.sendMessage(noWa, { text: "Pong" }, { quoted: message });
          }
        }
      }
    }
  });

  // end wa
}

function getSock() {
  return sock;
}
function saveMessageToJson(messageData) {
  const filename = "messages.json";
  let data = [];
  console.log("menyimpan data ke dalam file JSON");
  // Membaca file JSON jika sudah ada
  if (fs.existsSync(filename)) {
    const jsonData = fs.readFileSync(filename, "utf8");
    data = JSON.parse(jsonData);
  }

  // Menambahkan pesan baru ke dalam array
  data.push(messageData);

  // Menyimpan data ke dalam file JSON
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
}
module.exports = {
  connectToWhatsApp,
  getSock,
};
