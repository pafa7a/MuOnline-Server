import fs from "fs";
import path from "path";
import readline from "readline";

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


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const initCli = () => {
  rl.on("line", (input) => {
    const [commandName, ...args] = input.trim().split(" ");
    const command = commands[commandName];

    if (command) {
      try {
        command.execute(...args);
      } catch (err) {
        console.error(`Error executing command '${commandName}':`, err);
      }
    } else {
      console.log("Unknown command. Available commands:");
      Object.keys(commands).forEach((key) =>
        console.log(`- ${key}: ${commands[key].description}`)
      );
    }
  });
};
