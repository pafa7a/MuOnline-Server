import { IHandler } from "./types";

const RequestServerList: IHandler = {
  type: "Placeholder",
  handle: (ws, _) => {
    console.log("Placeholder handler");
  },
};

export default RequestServerList;