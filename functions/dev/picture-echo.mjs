// For the stand-in host's ?page=modify (dev/widget-host.ts): a picture link that answers a POSTed
// PNG with the same PNG, as if the image model had changed it. node dev/picture-echo.mjs [port]
import { createServer } from "node:http";

const port = Number(process.argv[2] ?? 8765);
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };

createServer((req, res) => {
  if (req.method === "OPTIONS") return res.writeHead(204, cors).end();
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    const body = Buffer.concat(chunks);
    console.log(`${req.method} ${req.url} ${body.length} bytes`);
    res.writeHead(200, { ...cors, "Content-Type": "image/png" }).end(body);
  });
}).listen(port, "127.0.0.1", () => console.log(`http://127.0.0.1:${port}/picture`));
