import { ServerList, Wrapper } from "@messages/connect";
import { IHandler } from "./types";

const RequestServerList: IHandler = {
  type: "RequestServerList",
  handle: (ws, _) => {
    const response = Wrapper.encode({
      type: "ServerList",
      payload: ServerList.encode({
        servers: [
          {
            name: "test",
            ip: "IP",
            port: 55901,
          },
          {
            name: (Math.random() + 1).toString(36).substring(7),
            ip: "IP2",
            port: 55919,
          },
        ]
      }).finish(),
    }).finish();
    ws.send(response);
  },
};

export default RequestServerList;