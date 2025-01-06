import { encodeHelloResponse } from "@messages/messages"; // Adjust the import path based on your project
import { decodeHelloResponse, decodeWrapper, encodeWrapper } from "../src/messages/messages";

function generateHexPayload() {
  // Example ProtoBuf message
  const message = {
    message: "Hello, server!", // Adjust fields based on your message schema
  };

  // Encode the message using ProtoBuf
  const encodedMessage = encodeWrapper({
    type: 'HelloResponse',
    payload: encodeHelloResponse(message),
  });

  // Convert the binary data to a hex string
  const hexPayload = Buffer.from(encodedMessage).toString("hex");

  console.log("Hex Payload:", hexPayload);

  const asd = Buffer.from('0A0361736412080000000203020302', 'hex');
  console.log('asd', decodeWrapper(asd))

}

generateHexPayload();
