import { getConnectServerConnection } from "@/helpers/connectServerConnection";
import { generateGameServerInfo } from "@/helpers/generateGameServerInfo";

export default {
  name: "send-info-to-connect-server",
  description: "Sends the server info to the connect server",
  async execute() {
    const response = generateGameServerInfo();
    const ws = getConnectServerConnection();
    ws?.send(response);
  },
};
