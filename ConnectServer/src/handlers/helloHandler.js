import { encodeHelloResponse } from "@messages/messages";

export default {
  messageType: "HelloResponse",
  handle: (client, message) => {
    console.log("Handling HelloResponse:", message);

    const response = { message: "Hello, client!" };
    const encoded = encodeHelloResponse(response);
    client.send(encoded);
  },
};
