const http = require("node:http");
const sharp = require("sharp");
const fs = require("node:fs");
const cors = require("cors");
const express = require("express");
const app = express();

app.use(cors());
app.use(express.static("public"));
app.post("/image/:fileformat/:quality/:width/:height", (req, res) => {
  if (req.method == "POST") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Disposition", "attachment;image.png");
    let length = 0;
    const chunks = [];
    let fileFormat = req.params.fileformat;
    let width = parseInt(req.params.width);
    let height = parseInt(req.params.height);
    let quality = parseInt(req.params.quality);
    req.addListener("data", (chunk) => {
      chunks.push(Buffer.from(chunk));
      // console.log(chunk);
      length += Buffer.from(chunk).length;
    });
    req.addListener("end", () => {
      // res.end("YUP Received you file");
      if (typeof height == "number") {
        resizeUsingSharp(
          chunks,
          length,
          fileFormat,
          res,
          quality,
          width,
          height
        );
      }
      if (!height) {
        resizeUsingSharp(chunks, length, fileFormat, res, quality, width);
      }
    });
  }
});
function resizeUsingSharp(
  chunks,
  length,
  fileFormat,
  res,
  quality,
  width,
  height = null
) {
  const imageData = Buffer.concat(chunks, length);
  // console.log(fileFormat);
  let originalFile = `original_${Math.round(
    Math.random() * 100000000
  )}.${fileFormat}`;
  let resizedFile = `resized_${Math.round(
    Math.random() * 100000000
  )}.${fileFormat}`;
  fs.writeFile(originalFile, imageData, "binary", async (e) => {
    if (e) {
      console.log(e);
    }
    if (fileFormat == "png") {
      if (!height) {
        await sharp(originalFile)
          .resize({ width, fit: "fill" })
          .png({ quality })
          .toFile(resizedFile)
          .then((suc) => {
            endTheRequest(fileFormat, res, originalFile, resizedFile);
          });
      }
      if (height) {
        await sharp(originalFile)
          .resize({ width, height, fit: "fill" })
          .png({ quality })
          .toFile(resizedFile)
          .then((suc) => {
            endTheRequest(fileFormat, res, originalFile, resizedFile);
          });
      }
    }
    if (fileFormat == "jpeg" || fileFormat == "jpg") {
      if (!height) {
        await sharp(originalFile)
          .resize({ width, fit: "fill" })
          .jpeg({ quality })
          .toFile(resizedFile)
          .then((suc) => {
            endTheRequest(fileFormat, res, originalFile, resizedFile);
          });
      }
      if (height) {
        await sharp(originalFile)
          .resize({ width, height, fit: "fill" })
          .jpeg({ quality })
          .toFile(resizedFile)
          .then((suc) => {
            endTheRequest(fileFormat, res, originalFile, resizedFile);
          });
      }
    }
  });
}
function endTheRequest(fileFormat, res, originalFile, resizedFile) {
  let fscr = fs.createReadStream(resizedFile, "base64");
  fscr.on("data", async (chunk) => {
    console.log(chunk.length);
    res.write(chunk);
  });
  fscr.on("end", () => {
    res.end();
    clearFiles(originalFile, resizedFile);
  });
  fscr.on("error", (err) => {
    console.log(err);
    clearFiles(originalFile, resizedFile);
  });
}
function clearFiles(originalFile, resizedFile) {
  fs.unlink(originalFile, (err) => {
    if (err) {
      console.log(err);
    }
    console.log("CLEARING ORIGINAL FILE");
  });
  fs.unlink(resizedFile, (err) => {
    console.log("CLEARING RESIZED FILE");
    console.log(err);
  });
}

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
