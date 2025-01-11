import { exec } from "child_process";

const pbjsCommand = `protoc --plugin=protoc-gen-ts_proto=".\\node_modules\\.bin\\protoc-gen-ts_proto.cmd" --ts_proto_out=. src/messages/connect.proto`;

// Execute pbjs command
console.log(`Running: ${pbjsCommand}`);
exec(pbjsCommand, (err, _, stderr) => {
  if (err) {
    console.error(`Error generating proto: ${stderr}`);
    process.exit(1);
  }
});
