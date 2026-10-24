// PM2 process file — `pm2 start ecosystem.config.cjs`
// One instance on purpose: the JSON user/order store and the in-memory caches
// are per-process. Move the store to a database before using cluster mode.
module.exports = {
  apps: [
    {
      name: "dazzlecare",
      script: ".next/standalone/server.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "700M",
      node_args: "--max-old-space-size=512",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "127.0.0.1",
        // nginx compresses responses (see deploy/nginx.conf.example)
        DISABLE_NEXT_COMPRESSION: "1",
        // users         DISABLE_NEXT_COMPRESSION: "1", orders live outside the build folder so deploys never wipe them
        DATA_DIR: require("node:path").join(__dirname, ".data"),
      },
    },
  ],
};
