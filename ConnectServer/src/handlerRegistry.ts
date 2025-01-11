import fs from "fs";
import path from "path";
import { WebSocket } from "ws";

const handlersDir = path.join(__dirname, "handlers");

interface Handler {
  type: string;
  handle: (ws: WebSocket, payload: Uint8Array) => void;
}

const handlers: { [key: string]: Handler } = {};

fs.readdirSync(handlersDir).forEach((file) => {
  const handler: Handler = require(path.join(handlersDir, file)).default;
  if (handler?.type) {
    handlers[handler.type] = handler;
  }
});

export default handlers;
