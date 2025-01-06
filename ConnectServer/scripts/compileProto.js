const { exec } = require("child_process");
const path = require("path");

// Paths
const protoFile = path.join(__dirname, "../src/messages/connect.proto");
const jsOutputFile = path.join(__dirname, "../src/messages/messages.js");

// Verify that the .proto file exists
if (!require("fs").existsSync(protoFile)) {
  console.error(`Error: ProtoBuf file not found at ${protoFile}`);
  process.exit(1);
}

// Command to generate modern ES6 JavaScript
const pbjsCommand = `npx pbjs --es6 "${jsOutputFile}" "${protoFile}"`;

// Execute pbjs command
console.log(`Running: ${pbjsCommand}`);
exec(pbjsCommand, (err, stdout, stderr) => {
  if (err) {
    console.error(`Error generating JavaScript: ${stderr}`);
    process.exit(1);
  }
  console.log(`Generated JavaScript: ${jsOutputFile}`);
});
