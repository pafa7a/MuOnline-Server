import fs from "fs";
import path from "path";

// Resolve the actual directory for @commands alias
const commandsDir = path.join(__dirname, "commands");

const commands = {};

// Auto-discover command files in the resolved directory
fs.readdirSync(commandsDir).forEach((file) => {
  if (file.endsWith(".js")) {
    const command = require(path.join(commandsDir, file)).default;

    // Ensure the command has a `name` and `execute` method
    if (command.name && typeof command.execute === "function") {
      commands[command.name] = command;
    } else {
      console.warn(`Skipping invalid command file: ${file}`);
    }
  }
});

export default commands;
