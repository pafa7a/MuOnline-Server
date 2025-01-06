import WebSocket from "ws";
import cliRegistry from "@server/cliRegistry";
import handlers from "@server/handlerRegistry";
import readline from "readline";
import { decodeHelloResponse } from "@messages/messages";

const PORT = 8080;
const connectedClients = new Set();

// WebSocket server setup
const wss = new WebSocket.Server({ port: PORT });

wss.on("connection", (ws) => {
  console.log("Client connected");
  connectedClients.add(ws);

  ws.on("message", (data) => {
    try {
      // Decode message type dynamically
      const decodedMessage = decodeHelloResponse(data);
      const messageType = "HelloResponse"; // Example: inferred from the decoded data

      // Find and execute the appropriate handler
      const handler = handlers[messageType];
      if (handler) {
        handler.handle(ws, decodedMessage);
      } else {
        console.error(`No handler found for message type: ${messageType}`);
      }
    } catch (err) {
      console.error("Failed to process message:", err);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    connectedClients.delete(ws);
  });
});

console.log(`WebSocket server is running on ws://localhost:${PORT}`);

// CLI interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("line", (input) => {
  const [commandName, ...args] = input.trim().split(" ");
  const command = cliRegistry[commandName];

  if (command) {
    try {
      command.execute(...args, connectedClients); // Pass arguments and clients
    } catch (err) {
      console.error(`Error executing command '${commandName}':`, err);
    }
  } else {
    console.log("Unknown command. Available commands:");
    Object.keys(cliRegistry).forEach((key) =>
      console.log(`- ${key}: ${cliRegistry[key].description}`)
    );
  }
});
