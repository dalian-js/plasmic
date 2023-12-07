module.exports = {
  apps: [
    {
      name: "backend",
      script: "yarn",
      args: ["backend"],
      time: true,
      env: {
        debug: 1,
        REACT_APP_DEFAULT_HOST_URL: `http://localhost:${
          process.env.HOSTSERVER_PORT || "3005"
        }/static/host.html`,
        CODEGEN_HOST: "http://localhost:3008",
        SOCKET_HOST: "http://localhost:3020",
        REACT_APP_CDN_URL: "http://localhost:3003",
        REACT_APP_PUBLIC_URL: "http://localhost:3003",
        INTEGRATIONS_HOST: "http://localhost:3003",
        ENABLED_GET_EMAIL_VERIFICATION_TOKEN: true,
        DISABLE_BWRAP: "1",
      },
      interpreter: "none",
    },
    {
      name: "socket-server",
      script: "./src/wab/server/esbuild-runner.js",
      args: ["src/wab/server/app-socket-backend-real.ts"],
      wait_ready: true,
      time: true,
      env: {
        SOCKET_PORT: 3020,
      },
      node_args: ["--max-old-space-size=2000"],
      interpreter: "none",
      exec_mode: "cluster",
      instances: 1,
      merge_logs: true,
    },
    ...(process.env["PM2_BACKEND_ONLY"]
      ? []
      : [
          {
            name: "wab-watch-css",
            script: "yarn",
            args: ["watch-css"],
            exec_mode: "fork_mode",
            autorestart: false,
            interpreter: "none",
          },
          {
            name: "sub-watch",
            script: "yarn",
            args: ["watch"],
            cwd: "../sub",
            exec_mode: "fork_mode",
            autorestart: false,
            interpreter: "none",
          },
          {
            name: "dev-server",
            script: "yarn",
            args: ["start"],
            exec_mode: "fork_mode",
            autorestart: false,
            interpreter: "none",
          },
          {
            name: "host-server",
            script: "yarn",
            args: ["host-server"],
            exec_mode: "fork_mode",
            autorestart: false,
            interpreter: "none",
          },
          {
            name: "codegen-backend",
            script: "yarn",
            args: ["run-ts", "src/wab/server/codegen-backend.ts"],
            time: true,
            env: {
              BACKEND_PORT: 3008,
              CODEGEN_HOST: "http://localhost:3008",
              INTEGRATIONS_HOST: "http://localhost:3003",
              REACT_APP_PUBLIC_URL: "http://localhost:3003",
            },
            node_args: ["--max-old-space-size=2000"],
            interpreter: "none",
          },
          {
            name: "plasmic-hosting",
            cwd: "../hosting",
            exec_mode: "fork_mode",
            interpreter: "none",
            autorestart: false,
            time: true,
            node_args: ["--max-old-space-size=2000"],
            script: "yarn",
            args: ["dev"],
            env: {
              PORT: 3009,
              NEXT_PUBLIC_PLASMIC_HOST: "http://localhost:3003",
              FORCE_BABDGE: "false",
              REVALIDATE_PERIOD: 0,
              BADGE_PROJECT: "",
              BADGE_TOKEN: "",
            },
          },
        ]),
  ],
};
