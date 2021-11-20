module.exports = {
  apps: [
    {
      name: 'chatstill',
      script: './server.js',
      exec_mode: 'cluster',
      instances: 3,
    },
  ],
};
