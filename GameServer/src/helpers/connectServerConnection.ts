import WebSocket from "ws";
import { getConfig } from "./configHelpers";
import { Wrapper } from "@/messages/gameserver";
import path from "path";
import fs from "fs";

let connectServerWs: WebSocket | null = null;

export const connectToConnectServer = () => {
  const handlers = getAllHandlers();
  const address = getConfig('common', 'connectServerAddress');
  const port = getConfig('common', 'connectServerPort');
  const serverCode = getConfig('common', 'code');
  const serverName = getConfig('common', 'name');
  const serverPort = getConfig('common', 'port');
  const serverGroup = getConfig('common', 'group');
  const url = `ws://${address}:${port}`;

  console.log(`Connecting to ConnectServer at ${url}`);

  connectServerWs = new WebSocket(url, {
    headers: {
      'X-Server-Code': serverCode.toString(),
      'X-Server-Name': serverName,
      'X-Server-Port': serverPort.toString(),
      'X-Server-Group': serverGroup.toString()
    }
  });

  connectServerWs.on('open', () => {
    if (!connectServerWs) return;
    console.log('Connected to ConnectServer');
    const originalSend = connectServerWs?.send;
    connectServerWs.send = function (data: any, ...args: any[]) {
      console.log(`GS->CS: ${Wrapper.decode(data).type}`);
      const options = args[0] || {};
      const cb = args[1] || (() => { });
      originalSend.apply(this, [data, options, cb]);
    };

    connectServerWs.send(Wrapper.encode({
      type: "ServerRegister",
      payload: new Uint8Array(),
    }).finish());
    
    // @TODO: Interval to send info to connectServer.
  });

  connectServerWs.on('message', (data) => {
    try {
      const wrapper = Wrapper.decode(data as Uint8Array);
      const { type, payload } = wrapper;
      if (!type) return;

      console.log(`CS->GS: ${type}`);

      const handler = handlers[type];
      if (connectServerWs && handler && typeof handler.handle === "function" && payload) {
        handler.handle(connectServerWs, payload);
      } else {
        console.error(`No handler found for type: ${type}`);
      }
    } catch (err) {
      console.error("Failed to process message:", err);
    }
  });

  connectServerWs.on('close', () => {
    console.log('Disconnected from Connect Server, attempting to reconnect in 5 seconds...');
    connectServerWs = null;
    setTimeout(connectToConnectServer, 5000);
  });

  connectServerWs.on('error', (error) => {
    console.error('Connect Server connection error:', error);
  });
};

export const getConnectServerConnection = () => connectServerWs;

const getAllHandlers = () => {
  const handlersDir = path.join(__dirname, "../handlers");

  interface Handler {
    type: string;
    handle: (ws: WebSocket, payload: Uint8Array) => void;
  }

  const handlers: { [key: string]: Handler } = {};

  fs.readdirSync(handlersDir).forEach((file) => {
    const handler: Handler = require(path.join(handlersDir, file)).default;
    if (handler?.type) {
      handlers[handler.type] = handler;
    }
  });
  return handlers;
};