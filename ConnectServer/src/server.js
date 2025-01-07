import WebSocket from "ws";
import cliRegistry from "@server/cliRegistry";
import handlers from "@server/handlerRegistry";
import readline from "readline";
import { decodeWrapper, encodeWrapper } from "@messages/messages"; // Import wrapper functions
import { encodeHelloResponse } from "@messages/messages";

const PORT = 8080;
const connectedClients = new Set();

/**
 * @typedef {WebSocket.Server & { 
*   broadcast: (msg: string | Buffer | ArrayBuffer | Buffer[]) => void 
* }} ExtendedWebSocketServer
*/

/**
* WebSocket server instance with custom broadcast functionality.
* @type {ExtendedWebSocketServer}
*/
const wss = new WebSocket.Server({ port: PORT });

wss.on("connection", (ws) => {
  console.log("Client connected");
  connectedClients.add(ws);

  // Send a "Hello" message to the client upon connection
  const helloMessage = { message: "Hello, client!" };
  const helloPayload = encodeHelloResponse(helloMessage);
  const wrapper = { type: "HelloResponse", payload: helloPayload };
  const encodedWrapper = encodeWrapper(wrapper);
  ws.send(encodedWrapper);

  ws.on("message", (data) => {
    try {
      // Decode the wrapper to identify message type and payload
      const wrapper = decodeWrapper(data);
      const { type, payload } = wrapper;

      console.log(`Received message of type: ${type}`);

      // Find and execute the appropriate handler
      const handler = handlers[type];
      if (handler) {
        handler.handle(ws, payload);
      }
      else {
        console.error(`No handler found for type: ${type}`);
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

wss.broadcast = (msg) => {
  wss.clients.forEach(client => {
    client.send(msg);
  });
};

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
      command.execute(...args); // Pass arguments and clients
    } catch (err) {
      console.error(`Error executing command '${commandName}':`, err);
    }
  }
  else {
    if (typeof command !== 'undefined') {
      console.log("Unknown command. Available commands:");
      Object.keys(cliRegistry).forEach((key) =>
        console.log(`- ${key}: ${cliRegistry[key].description}`)
      );
    }
  }
});

export {
  wss,
  connectedClients
}