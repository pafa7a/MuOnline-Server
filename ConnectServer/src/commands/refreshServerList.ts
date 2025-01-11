import { ServerList, Wrapper } from "@messages/connect";
import { wss } from "@server/index";

export default {
  name: "refreshServerList",
  description: "Send the updated server list to all connected clients",
  execute(args: any) {
    console.log("Refreshing server list...");
    const response = Wrapper.encode({
      type: 'ServerList',
      payload: ServerList.encode({
        servers: [
          {
            name: 'test',
            ip: 'IP',
            port: 55901
          },
          {
            name:(Math.random() + 1).toString(36).substring(7),
            ip: 'IP2',
            port: 55919
          }
        ]
      }).finish()
    }).finish();
    wss.broadcast(response);
  },
};
