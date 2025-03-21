import WebSocket, { WebSocketServer } from "ws";
import { Wrapper } from "@/messages/connect";
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
}

interface ConnectedInternalClient {
  ws: WebSocket;
  name: String;
  port: Number;
  group: Number;
  IP: String;
  loadPercentage?: String;
  onlinePlayers?: Number;
}

interface ExtendedWebSocketServer extends WebSocketServer {
  broadcast: (msg: Uint8Array<ArrayBufferLike>) => void;
}

export const externalClients = new Set<ConnectedClient>();
export const internalClients = new Map<Number, ConnectedInternalClient>();

export let externalWss: ExtendedWebSocketServer;
export let internalWss: ExtendedWebSocketServer;

// Load SSL certificate for WSS
const sslOptions = {
  key: fs.readFileSync("C:/Certs/die-mu.com/die-mu.com-key.pem"),
  cert: fs.readFileSync("C:/Certs/die-mu.com/die-mu.com-crt.pem"),
  ca: fs.readFileSync("C:/Certs/die-mu.com/die-mu.com-chain.pem")
};

const createWebSocketServer = (
  serverOrPort: https.Server | number,
  clients: Set<ConnectedClient> | Map<Number, ConnectedInternalClient>,
  serverType: "external" | "internal",
  useWSS: boolean
) => {
  const handlers = getAllHandlers();
  const wss =
    serverType === "external" && useWSS
      ? new WebSocketServer({ server: serverOrPort as https.Server }) as ExtendedWebSocketServer
      : new WebSocketServer({ port: serverOrPort as number }) as ExtendedWebSocketServer;

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const originalSend = ws.send;
    ws.send = function (data: any, ...args: any[]) {
      let direction = "CS->C";
      if (serverType === "internal") {
        direction = "CS->GS";
      }
      console.log(`[${serverType.toUpperCase()}] ${direction}: ${Wrapper.decode(data).type}`);
      const options = args[0] || {};
      const cb = args[1] || (() => { });
      originalSend.apply(this, [data, options, cb]);
    };

    let connectedClient: ConnectedClient | ConnectedInternalClient;

    if (serverType === "external") {
      connectedClient = {
        ws,
        remoteAddress: req.socket.remoteAddress || "",
        remotePort: req.socket.remotePort || 0,
        osType: getConnectedPlayerOSType(req.headers),
        osVersion: getConnectedPlayerOSVersion(req.headers)
      };
      (clients as Set<ConnectedClient>).add(connectedClient);

      console.log(
        `Client connected. IP: ${connectedClient.remoteAddress}, Port: ${connectedClient.remotePort}, OS: ${connectedClient.osType} ${connectedClient.osVersion}`
      );
    } else {
      const id = Number(req?.headers["x-server-code"]) || 0;
      connectedClient = {
        ws,
        name: req?.headers["x-server-name"]?.toString() || "",
        port: Number(req?.headers["x-server-port"]) || 0,
        group: Number(req?.headers["x-server-group"]) || 0,
        IP: req?.socket?.remoteAddress?.replace("::ffff:", "") || ""
      };
      (clients as Map<Number, ConnectedInternalClient>).set(id, connectedClient);

      console.log(
        `GameServer connected. ID: ${id}, Name: ${connectedClient.name}, Port: ${connectedClient.port}, Group: ${connectedClient.group}, IP: ${connectedClient.IP}`
      );
    }

    // Send the init packet.
    const initPacketWrapper = Wrapper.encode({
      type: "Init",
      payload: new Uint8Array()
    }).finish();
    ws.send(initPacketWrapper);

    ws.on("message", (data) => {
      try {
        const wrapper = Wrapper.decode(data as Uint8Array);
        const { type, payload } = wrapper;
        if (!type) return;

        let direction = "C->CS";
        if (serverType === "internal") {
          direction = "GS->CS";
        }

        console.log(`[${serverType.toUpperCase()}] ${direction}: ${type}`);

        const handler = handlers[type];
        if (handler && typeof handler.handle === "function" && payload) {
          const requestHeaders = req?.headers;
          handler.handle(ws, payload, requestHeaders);
        } else {
          console.error(`No handler found for type: ${type}`);
        }
      } catch (err) {
        console.error("Failed to process message:", err);
      }
    });

    ws.on("close", () => {
      if (serverType === "external") {
        (clients as Set<ConnectedClient>).delete(connectedClient as ConnectedClient);
        console.log(`${serverType.toUpperCase()} Client disconnected.`);
      } else {
        const id = Number(req?.headers["x-server-code"]) || 0;
        (clients as Map<Number, ConnectedInternalClient>).delete(id);
        console.log(`${serverType.toUpperCase()} GameServer disconnected.`);
      }
    });
  });

  wss.broadcast = (msg) => {
    wss.clients.forEach((client) => {
      client.send(msg);
    });
  };

  return wss;
};

export const initWebSocketServer = () => {
  const EXTERNAL_PORT = getConfig("common", "port");
  const INTERNAL_PORT = getConfig("common", "internalPort");
  const HOSTNAME = getConfig("common", "hostname");
  const useWSS = getConfig("common", "useWSS");

  let externalServer: https.Server | number;

  if (useWSS) {
    externalServer = https.createServer(sslOptions);
    (externalServer as https.Server).listen(EXTERNAL_PORT, () => {
      console.log(`External WebSocket Secure (WSS) Server running on wss://${HOSTNAME}:${EXTERNAL_PORT}`);
    });
  }
  else {
    externalServer = EXTERNAL_PORT;
    console.log(`External WebSocket Server running on ws://${HOSTNAME}:${EXTERNAL_PORT}`);
  }

  externalWss = createWebSocketServer(externalServer, externalClients, "external", useWSS);
  internalWss = createWebSocketServer(INTERNAL_PORT, internalClients, "internal", false);

  console.log(`Internal WebSocket Server running on ws://127.0.0.1:${INTERNAL_PORT}`);
};
