import WebSocket, { WebSocketServer } from "ws";
import { Wrapper, PlayerDisconnected } from "@/messages/gameserver";
import { IncomingMessage } from "http";
import { getConnectedPlayerOSType, getConnectedPlayerOSVersion } from "@/helpers/connectHelpers";
import { getConfig } from "@/helpers/configHelpers";
import { getAllHandlers } from "@/helpers/getAllHandlers";
import fs from "fs";
import https from "https";

interface ConnectedClient {
  ws: WebSocket;
  remoteAddress: String;
  remotePort: Number;
  osType: String;
  osVersion: String;
  userId?: number;
  failedAttempts: number;
}

interface PlayerState {
  id: number;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  isInWorld: Boolean;
  connectedClient: ConnectedClient;
}

export const connectedClients = new Set<ConnectedClient>();
export const playerStates: Map<number, PlayerState> = new Map();
export const wsToUserId: Map<WebSocket, number> = new Map();

interface ExtendedWebSocketServer extends WebSocketServer {
  broadcast: (msg: Uint8Array<ArrayBufferLike>) => void;
  broadcastExceptSender: (msg: Uint8Array<ArrayBufferLike>, sender: WebSocket) => void;
}

export let wss: ExtendedWebSocketServer;

// Load SSL certificate for WSS
const sslOptions = {
  key: fs.readFileSync("C:/Certs/server.mu.tsan.dev-key.pem"),
  cert: fs.readFileSync("C:/Certs/server.mu.tsan.dev-crt.pem"),
  ca: fs.readFileSync("C:/Certs/server.mu.tsan.dev-chain.pem")
};

export const initWebSocketServer = () => {
  const handlers = getAllHandlers();
  const PORT = getConfig('common', 'port');
  const HOSTNAME = getConfig('common', 'hostname');
  const useWSS = getConfig('common', 'useWSS');

  let server: https.Server | number;

  if (useWSS) {
    server = https.createServer(sslOptions);
    (server as https.Server).listen(PORT, () => {
      console.log(`GameServer WebSocket Secure (WSS) Server running on wss://${HOSTNAME}:${PORT}`);
    });
  }
  else {
    server = PORT;
    console.log(`GameServer WebSocket Server running on ws://${HOSTNAME}:${PORT}`);
  }
  
  wss = new WebSocketServer(typeof server === "number" ? { port: server } : { server }) as ExtendedWebSocketServer;

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const originalSend = ws.send;
    ws.send = function (data: any, ...args: any[]) {
      try {
        console.log(`GS->C: ${Wrapper.decode(data).type}`);
        const options = args[0] || {};
        const cb = args[1] || (() => { });
        originalSend.apply(this, [data, options, cb]);
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    };

    const connectedClient: ConnectedClient = {
      ws,
      remoteAddress: req.socket.remoteAddress || "",
      remotePort: req.socket.remotePort || 0,
      osType: getConnectedPlayerOSType(req.headers),
      osVersion: getConnectedPlayerOSVersion(req.headers),
      failedAttempts: 0
    };
    connectedClients.add(connectedClient);

    console.log(`Client connected. IP: ${connectedClient.remoteAddress}, Port: ${connectedClient.remotePort}, OS: ${connectedClient.osType} ${connectedClient.osVersion}`);

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
      const userId = wsToUserId.get(ws);
      wsToUserId.delete(ws);
      if (userId) {
        playerStates.delete(userId);
        const playerLeftPacket = Wrapper.encode({
          type: 'PlayerDisconnected',
          payload: PlayerDisconnected.encode({
            id: userId.toString(),
          }).finish(),
        }).finish();
        wss.broadcastExceptSender(playerLeftPacket, ws);
      }

    });
  });

  wss.broadcast = (msg) => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  };

  wss.broadcastExceptSender = (msg, sender) => {
    Array.from(wss.clients)
      .filter(client => client !== sender && client.readyState === WebSocket.OPEN)
      .forEach(client => client.send(msg));
  };
};
