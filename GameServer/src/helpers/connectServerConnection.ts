import WebSocket from "ws";
import { getConfig } from "./configHelpers";
import { Wrapper } from "@/messages/gameserver";
import { getAllHandlers } from "@/helpers/getAllHandlers";

let connectServerWs: WebSocket | null = null;

export const connectToConnectServer = () => {
  const handlers = getAllHandlers();
  const address = getConfig('common', 'connectServerAddress');
  const port = getConfig('common', 'connectServerPort');
  const serverCode = getConfig('common', 'serverCode');
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
      console.log(`[INTERNAL] GS->CS: ${Wrapper.decode(data).type}`);
      const options = args[0] || {};
      const cb = args[1] || (() => { });
      originalSend.apply(this, [data, options, cb]);
    };
  });

  connectServerWs.on('message', (data) => {
    try {
      const wrapper = Wrapper.decode(data as Uint8Array);
      const { type, payload } = wrapper;
      if (!type) return;

      console.log(`[INTERNAL] CS->GS: ${type}`);

      const handler = handlers[type];
      if (connectServerWs && handler && typeof handler.handle === "function" && payload) {
        handler.handle(connectServerWs, payload, 'connectServer');
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
