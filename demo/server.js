/**
 * localhtml-lib needs to be hosted on a server to work around CORS.
 * This is no longer necessary once the document has been saved locally.
 *
 * This code is for a simple static-file server and is based on:
 * https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

http
  .createServer(function (request, response) {
    let filePath = "demo" + request.url;
    if (filePath == "demo/") {
      filePath = "demo/index.html";
    } else if (filePath == "demo/localhtml.min.js") {
      filePath = "docs/localhtml.min.js";
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".wav": "audio/wav",
      ".mp4": "video/mp4",
      ".woff": "application/font-woff",
      ".ttf": "application/font-ttf",
      ".eot": "application/vnd.ms-fontobject",
      ".otf": "application/font-otf",
      ".wasm": "application/wasm",
    };

    const contentType = mimeTypes[extname] || "application/octet-stream";

    fs.readFile(filePath, function (error, content) {
      if (error) {
        if (error.code == "ENOENT") {
          response.writeHead(404, { "Content-Type": "text/html" });
          response.end("Not Found", "utf-8");
        } else {
          response.writeHead(500);
          response.end(
            "Sorry, check with the site admin for error: " +
              error.code +
              " ..\n"
          );
        }
      } else {
        response.writeHead(200, { "Content-Type": contentType });
        response.end(content, "utf-8");
      }
    });
  })
  .listen(3000);
console.log("Server running at http://127.0.0.1:3000/");
