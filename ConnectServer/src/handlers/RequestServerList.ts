import { ServerGroupList, Wrapper } from "@/messages/connect";
import { IHandler } from "./types";

const RequestServerList: IHandler = {
  type: "RequestServerGroupList",
  handle: (ws, _) => {
    const response = Wrapper.encode({
      type: "ServerGroupList",
      payload: ServerGroupList.encode({
        serverGroups: [
          {
            name: "PvP",
            servers: [
              {
                id: 0,
                name: "Test Server",
                ip: "127.0.0.1",
                port: 55901,
                loadPercentage: 0.5,
              },
              {
                id: 1,
                name: "Test Server2",
                ip: "127.0.0.1",
                port: 55903,
                loadPercentage: 0.1,
              }
            ],
          },
          {
            name: "NoN PvP " + Math.floor(Math.random() * 101),
            servers: [
              {
                id: 2,
                name: "Test Server " + Math.floor(Math.random() * 101),
                ip: "127.0.0.1",
                port: 55910,
                loadPercentage: 0.5,
              },
              {
                id: 3,
                name: "Test Server " + Math.floor(Math.random() * 101),
                ip: "127.0.0.1",
                port: 55920,
                loadPercentage: 0.3,
              },
              {
                id: 4,
                name: "Test Server " + Math.floor(Math.random() * 101),
                ip: "127.0.0.1",
                port: 55921,
                loadPercentage: 0.2,
              }
            ],
          }
        ],
      }).finish(),
    }).finish();
    ws.send(response);
  },
};

export default RequestServerList;