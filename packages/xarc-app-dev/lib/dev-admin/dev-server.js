"use strict";

/* eslint-disable global-require, no-console */

const ck = require("chalker");
const archetype = require("@xarc/app/config/archetype");
const optionalRequire = require("optional-require")(require);
const electrodeServer = optionalRequire("electrode-server");
const Hapi = optionalRequire("@hapi/hapi");
const Koa = optionalRequire("koa");
const express = optionalRequire("express");

//
// indicate that app is running in webpack dev mode
// also set by @xarc/app/arch-clap.js
//
if (process.env.WEBPACK_DEV === undefined) {
  process.env.WEBPACK_DEV = true;
}

if (electrodeServer) {
  electrodeServer({
    electrode: {
      logLevel: "warn"
    },
    connections: {
      default: {
        host: archetype.webpack.devHostname,
        port: archetype.webpack.devPort
      }
    },
    plugins: {
      webpackDevHapi: {
        module: "./dev-hapi.js",
        requireFromPath: __dirname
      }
    }
  });
} else if (Hapi) {
  const app = Hapi.server({
    port: archetype.webpack.devPort,
    host: archetype.webpack.devHostname
  });
  app
    .register(require("./dev-hapi"))
    .then(() => app.start())
    .then(() => {
      console.log(
        ck`<green>Hapi webpack dev server listening on port ${archetype.webpack.devPort}</>`
      );
    })
    .catch(err => {
      console.error(ck`<red>koa webpack dev server failed</>${err}`);
    });
} else if (Koa) {
  const app = new Koa();
  const setup = require("./dev-koa");
  setup(app);
  app.listen(archetype.webpack.devPort, err => {
    if (err) {
      console.error(ck`<red>koa webpack dev server failed</>${err}`);
    } else {
      console.log(
        ck`<green>koa webpack dev server listening on port ${archetype.webpack.devPort}</>`
      );
    }
  });
} else if (express) {
  const app = express();
  const setup = require("./dev-express");
  setup(app);
  app.listen(archetype.webpack.devPort, err => {
    if (err) {
      console.error(ck`<red>express webpack dev server failed</>${err}`);
    } else {
      console.log(
        ck`<green>express webpack dev server listening on port ${archetype.webpack.devPort}</>`
      );
    }
  });
} else {
  console.error(
    ck(`<red>
ERROR: can't find one of electrode-server, express, koa to run dev-server.
</red>`)
  );
}
