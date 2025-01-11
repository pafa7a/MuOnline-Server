import { WebSocket, WebSocketServer } from "ws";
import cliRegistry from "@server/cliRegistry";
import handlers from "@server/handlerRegistry";
import readline from "readline";
import { Wrapper, HelloResponse } from "@messages/connect";

const PORT = 8080;
const connectedClients = new Set<WebSocket>();

interface ExtendedWebSocketServer extends WebSocketServer {
  broadcast: (msg: string | Buffer | ArrayBuffer | Buffer[]) => void;
}

const wss: ExtendedWebSocketServer = new WebSocketServer({ port: PORT }) as ExtendedWebSocketServer;

wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");
  connectedClients.add(ws);

  const helloMessage = { message: "Hello, client!" };
  const helloPayload = HelloResponse.encode(helloMessage).finish();
  const wrapper = { type: "HelloResponse", payload: helloPayload };
  const encodedWrapper = Wrapper.encode(wrapper).finish();
  ws.send(encodedWrapper);

  ws.on("message", (data) => {
    try {
      const wrapper = Wrapper.decode(data as Uint8Array);
      const { type, payload } = wrapper;
      if (!type) {
        return;
      }

      console.log(`Received message of type: ${type}`);

      const handler = handlers[type];
      if (handler && typeof handler.handle === "function" && payload) {
        handler.handle(ws, payload);
      } else {
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("line", (input) => {
  const [commandName, ...args] = input.trim().split(" ");
  const command = cliRegistry[commandName];

  if (command) {
    try {
      command.execute(...args);
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

export {
  wss,
  connectedClients
};
