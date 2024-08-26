const express = require("express");
const router = express.Router();
const { getSock } = require("../modul/baileywa");
const fs = require("fs");
const path = require("path");

router.post("/", async (req, res) => {
  //console.log(req);
  const pesankirim = req.body.message;
  const id_group = req.body.id_group;
  const fileDikirim = req.files;
  let idgroup;
  let exist_idgroup;
  try {
    if (isConnected) {
      if (!req.files) {
        if (!id_group) {
          res.status(500).json({
            status: false,
            response: "Nomor Id Group belum disertakan!",
          });
        } else {
          let exist_idgroup = await sock.groupMetadata(id_group);
          console.log(exist_idgroup.id);
          console.log("isConnected");
          if (exist_idgroup?.id || (exist_idgroup && exist_idgroup[0]?.id)) {
            sock
              .sendMessage(id_group, { text: pesankirim })
              .then((result) => {
                res.status(200).json({
                  status: true,
                  response: result,
                });
                console.log("succes terkirim");
              })
              .catch((err) => {
                res.status(500).json({
                  status: false,
                  response: err,
                });
                console.log("error 500");
              });
          } else {
            res.status(500).json({
              status: false,
              response: `ID Group ${id_group} tidak terdaftar.`,
            });
            console.log(`ID Group ${id_group} tidak terdaftar.`);
          }
        }
      } else {
        //console.log('Kirim document');
        if (!id_group) {
          res.status(500).json({
            status: false,
            response: "Id Group tidak disertakan!",
          });
        } else {
          exist_idgroup = await sock.groupMetadata(id_group);
          console.log(exist_idgroup.id);
          //console.log('Kirim document ke group'+ exist_idgroup.subject);

          let filesimpan = req.files.file_dikirim;
          var file_ubah_nama = new Date().getTime() + "_" + filesimpan.name;
          //pindahkan file ke dalam upload directory
          filesimpan.mv("./uploads/" + file_ubah_nama);
          let fileDikirim_Mime = filesimpan.mimetype;
          //console.log('Simpan document '+fileDikirim_Mime);
          if (isConnected) {
            if (exist_idgroup?.id || (exist_idgroup && exist_idgroup[0]?.id)) {
              let namafiledikirim = "./uploads/" + file_ubah_nama;
              let extensionName = path.extname(namafiledikirim);
              //console.log(extensionName);
              if (
                extensionName === ".jpeg" ||
                extensionName === ".jpg" ||
                extensionName === ".png" ||
                extensionName === ".gif"
              ) {
                await sock
                  .sendMessage(exist_idgroup.id || exist_idgroup[0].id, {
                    image: {
                      url: namafiledikirim,
                    },
                    caption: pesankirim,
                  })
                  .then((result) => {
                    if (fs.existsSync(namafiledikirim)) {
                      fs.unlink(namafiledikirim, (err) => {
                        if (err && err.code == "ENOENT") {
                          // file doens't exist
                          console.info("File doesn't exist, won't remove it.");
                        } else if (err) {
                          console.error(
                            "Error occurred while trying to remove file."
                          );
                        }
                        //console.log('File deleted!');
                      });
                    }
                    res.send({
                      status: true,
                      message: "Success",
                      data: {
                        name: filesimpan.name,
                        mimetype: filesimpan.mimetype,
                        size: filesimpan.size,
                      },
                    });
                  })
                  .catch((err) => {
                    res.status(500).json({
                      status: false,
                      response: err,
                    });
                    console.log("pesan gagal terkirim");
                  });
              } else if (extensionName === ".mp3" || extensionName === ".ogg") {
                await sock
                  .sendMessage(exist_idgroup.id || exist_idgroup[0].id, {
                    audio: {
                      url: namafiledikirim,
                      caption: pesankirim,
                    },
                    mimetype: "audio/mp4",
                  })
                  .then((result) => {
                    if (fs.existsSync(namafiledikirim)) {
                      fs.unlink(namafiledikirim, (err) => {
                        if (err && err.code == "ENOENT") {
                          // file doens't exist
                          console.info("File doesn't exist, won't remove it.");
                        } else if (err) {
                          console.error(
                            "Error occurred while trying to remove file."
                          );
                        }
                        //console.log('File deleted!');
                      });
                    }
                    res.send({
                      status: true,
                      message: "Success",
                      data: {
                        name: filesimpan.name,
                        mimetype: filesimpan.mimetype,
                        size: filesimpan.size,
                      },
                    });
                  })
                  .catch((err) => {
                    res.status(500).json({
                      status: false,
                      response: err,
                    });
                    console.log("pesan gagal terkirim");
                  });
              } else {
                await sock
                  .sendMessage(exist_idgroup.id || exist_idgroup[0].id, {
                    document: {
                      url: namafiledikirim,
                      caption: pesankirim,
                    },
                    mimetype: fileDikirim_Mime,
                    fileName: filesimpan.name,
                  })
                  .then((result) => {
                    if (fs.existsSync(namafiledikirim)) {
                      fs.unlink(namafiledikirim, (err) => {
                        if (err && err.code == "ENOENT") {
                          // file doens't exist
                          console.info("File doesn't exist, won't remove it.");
                        } else if (err) {
                          console.error(
                            "Error occurred while trying to remove file."
                          );
                        }
                        //console.log('File deleted!');
                      });
                    }

                    setTimeout(() => {
                      sock.sendMessage(
                        exist_idgroup.id || exist_idgroup[0].id,
                        { text: pesankirim }
                      );
                    }, 1000);

                    res.send({
                      status: true,
                      message: "Success",
                      data: {
                        name: filesimpan.name,
                        mimetype: filesimpan.mimetype,
                        size: filesimpan.size,
                      },
                    });
                  })
                  .catch((err) => {
                    res.status(500).json({
                      status: false,
                      response: err,
                    });
                    console.log("pesan gagal terkirim");
                  });
              }
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

      //end is connected
    } else {
      res.status(500).json({
        status: false,
        response: `WhatsApp belum terhubung.`,
      });
    }

    //end try
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
