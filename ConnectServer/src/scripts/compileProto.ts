import { exec } from "child_process";

const compileTsCommand = `protoc --plugin=protoc-gen-ts_proto=".\\node_modules\\.bin\\protoc-gen-ts_proto.cmd" --ts_proto_out=. src/messages/connect.proto`;

console.log(`Running: ${compileTsCommand}`);
exec(compileTsCommand, (err, _, stderr) => {
  if (err) {
    console.error(`Error generating proto: ${stderr}`);
    process.exit(1);
  }
});

const compileCSharpCommand = `protoc --csharp_out=src/messages/ src/messages/connect.proto`;

console.log(`Running: ${compileCSharpCommand}`);
exec(compileCSharpCommand, (err, _, stderr) => {
  if (err) {
    console.error(`Error generating proto: ${stderr}`);
    process.exit(1);
  }
});
