// Register module aliases
require("module-alias/register");

// Enable runtime transpilation with Babel
require("@babel/register")({
  extensions: [".js"], // Transpile .js files on the fly
});

// Start the server
require("@server/server");
