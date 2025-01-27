import WebSocket, { WebSocketServer } from "ws";
import { Wrapper } from "@/messages/gameserver";
import { IncomingMessage } from "http";
import { getConnectedPlayerOSType, getConnectedPlayerOSVersion } from "@/helpers/connectHelpers";
import { getConfig } from "@/helpers/configHelpers";
import { getAllHandlers } from "@/helpers/getAllHandlers";

interface ConnectedClient {
  ws: WebSocket;
  remoteAddress: String;
  remotePort: Number;
  osType: String;
  osVersion: String;
}

export const connectedClients = new Set<ConnectedClient>();

interface ExtendedWebSocketServer extends WebSocketServer {
  broadcast: (msg: Uint8Array<ArrayBufferLike>) => void;
}

export let wss: ExtendedWebSocketServer;

export const initWebSocketServer = () => {
  const handlers = getAllHandlers();
  const PORT = getConfig('common', 'port');
  wss = new WebSocketServer({ port: PORT }) as ExtendedWebSocketServer;

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const originalSend = ws.send;
    ws.send = function (data: any, ...args: any[]) {
      console.log(`GS->C: ${Wrapper.decode(data).type}`);
      const options = args[0] || {};
      const cb = args[1] || (() => { });
      originalSend.apply(this, [data, options, cb]);
    };

    const connectedClient: ConnectedClient = {
      ws,
      remoteAddress: req.socket.remoteAddress || "",
      remotePort: req.socket.remotePort || 0,
      osType: getConnectedPlayerOSType(req.headers),
      osVersion: getConnectedPlayerOSVersion(req.headers)
    };
    connectedClients.add(connectedClient);

    console.log(`Client connected. IP: ${connectedClient.remoteAddress}, Port: ${connectedClient.remotePort}, OS: ${connectedClient.osType} ${connectedClient.osVersion}`);

    // Send the init packet.
    const initPacketWrapper = Wrapper.encode({
      type: 'Init',
      payload: new Uint8Array(),
    }).finish();
    ws.send(initPacketWrapper);

    ws.on("message", (data) => {
      try {
        const wrapper = Wrapper.decode(data as Uint8Array);
        const { type, payload } = wrapper;
        if (!type) {
          return;
        }

        console.log(`C->GS: ${type}`);

        const handler = handlers[type];
        if (handler && typeof handler.handle === "function" && payload) {
          handler.handle(ws, payload, "client");
        } else {
          console.error(`No handler found for type: ${type}`);
        }
      } catch (err) {
        console.error("Failed to process message:", err);
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");
      connectedClients.delete(connectedClient);
    });
  });

  wss.broadcast = (msg) => {
    wss.clients.forEach(client => {
      client.send(msg);
    });
  };

  console.log(`WebSocket server is running on ws://localhost:${PORT}`);
};