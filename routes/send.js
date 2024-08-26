const express = require("express");
const router = express.Router();
const { getSock } = require("../modul/baileywa");
const fs = require("fs");
const path = require("path");

router.post("/", async (req, res) => {
  const pesankirim = req.body.message;
  const number = req.body.number;
  const fileDikirim = req.files;

  let numberWA;
  try {
    if (!req.files) {
      if (!number) {
        res.status(500).json({
          status: false,
          response: "Nomor WA belum tidak disertakan!",
        });
      } else {
        numberWA = "62" + number.substring(1) + "@s.whatsapp.net";
        const sock = getSock();
        if (sock) {
          const exists = await sock.onWhatsApp(numberWA);
          if (exists?.jid || (exists && exists[0]?.jid)) {
            sock
              .sendMessage(exists.jid || exists[0].jid, { text: pesankirim })
              .then((result) => {
                res.status(200).json({
                  status: true,
                  response: result,
                });
              })
              .catch((err) => {
                res.status(500).json({
                  status: false,
                  response: err,
                });
              });
          } else {
            res.status(500).json({
              status: false,
              response: `Nomor ${number} tidak terdaftar.`,
            });
          }
        } else {
          res.status(500).json({
            status: false,
            response: `WhatsApp belum terhubung.`,
          });
        }
      }
    }
    // Implementasi untuk pengiriman file bisa disesuaikan serupa dengan di atas
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
