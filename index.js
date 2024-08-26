const path = require("path");
const fs = require("fs");
const http = require("http");
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

const {
  connectToWhatsApp,
  getSock,
  setSocket,
  getQr,
  isConnected,
} = require("./modul/baileywa");

// enable files upload
app.use(
  fileUpload({
    createParentPath: true,
  })
);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 8870;

app.use("/assets", express.static(path.join(__dirname, "/client/assets")));

const routersDir = path.join(__dirname, "routes");

fs.readdirSync(routersDir).forEach((file) => {
  const routerPath = path.join(routersDir, file);
  const router = require(routerPath);
  const routeName = "/" + file.split(".")[0];
  app.use(routeName, router);
});

app.get("/", (req, res) => {
  res.sendFile("./client/index.html", {
    root: __dirname,
  });
});

connectToWhatsApp().catch((err) => console.log("unexpected error: " + err));

server.listen(port, () => {
  console.log("Server Berjalan pada Port : " + port);
});
