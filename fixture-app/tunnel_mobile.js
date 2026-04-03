const localtunnel = require('localtunnel');

(async () => {
  const backendTunnel = await localtunnel({ port: 3000 });
  const frontendTunnel = await localtunnel({ port: 4200 });

  console.log(`=== MOBILE TESTING LINKS ===`);
  console.log(`BACKEND_URL=${backendTunnel.url}`);
  console.log(`FRONTEND_URL=${frontendTunnel.url}`);
  console.log(`============================`);
  console.log('Tunnels are running. Press Ctrl+C to stop.');

  backendTunnel.on('close', () => {
    console.log('Backend tunnel closed');
  });

  frontendTunnel.on('close', () => {
    console.log('Frontend tunnel closed');
  });

  // Keep the process alive indefinitely
  setInterval(() => {}, 1000);
})();
