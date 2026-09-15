// ChronoLux - Oddiy va tezkor lokal server (Node.js)
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split("?")[0];
  let filePath = path.join(__dirname, reqUrl === "/" ? "index.html" : reqUrl);

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<h1>404 Sahifa topilmadi</h1>");
      } else {
        res.writeHead(500);
        res.end(`Server xatosi: ${err.code}`);
      }
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🌟 ChronoLux Qo'l Soatlari Do'koni ishga tushdi!`);
  console.log(`🔗 Brauzerda ochish: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
