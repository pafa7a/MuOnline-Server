import { SCServerListResponse, Wrapper } from "@messages/connect";
import { IHandler } from "./types";

const CSRequestServerList: IHandler = {
  type: "CSRequestServerList",
  handle: (ws, _) => {
    const response = Wrapper.encode({
      type: "SCRequestServerList",
      payload: SCServerListResponse.encode({
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

export default CSRequestServerList;