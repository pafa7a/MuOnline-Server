import { IHandler } from "./types";
import { generateGameServerInfo } from "@/helpers/generateGameServerInfo";

let interval: NodeJS.Timeout;

const Init: IHandler = {
  type: "Init",
  handle: (ws, _, source) => {
    if (source === 'connectServer') {
      const sendInfo = () => {
        const response = generateGameServerInfo();
        ws.send(response);
      }
      sendInfo();
      
      if (interval) {
        clearInterval(interval);
      }
      interval = setInterval(() => {
        sendInfo();
        console.log(`Date: ${new Date().toISOString()}`);
      }, 60000);
    }
  },
};

export default Init;