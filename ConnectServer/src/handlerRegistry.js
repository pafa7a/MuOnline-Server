import fs from "fs";
import path from "path";

const handlers = {};

// Auto-discover handler files in the `@handlers` directory
const handlersDir = path.join(__dirname, "handlers");

fs.readdirSync(handlersDir).forEach((file) => {
  if (file.endsWith(".js")) {
    const handler = require(path.join(handlersDir, file)).default;
    handlers[handler.messageType] = handler;
  }
});

export default handlers;
