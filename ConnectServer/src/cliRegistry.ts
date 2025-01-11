import fs from "fs";
import path from "path";

const commandsDir = path.join(__dirname, "commands");

interface Command {
  name: string;
  description: string;
  execute: (...args: any[]) => void;
}

const commands: { [key: string]: Command } = {};

fs.readdirSync(commandsDir).forEach((file) => {
  const command: Command = require(path.join(commandsDir, file)).default;
  if (command.name && typeof command.execute === "function") {
    commands[command.name] = command;
  } else {
    console.warn(`Skipping invalid command file: ${file}`);
  }
});

export default commands;
