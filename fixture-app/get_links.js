const localtunnel = require('localtunnel');
const fs = require('fs');

async function startTunnels() {
    console.log('--- COMENZANDO PROCESO DE TUNELES ---');
    try {
        const tunnel3000 = await localtunnel({ port: 3000 });
        console.log('BACKEND_URL_FOUND:' + tunnel3000.url);
        fs.writeFileSync('url_3000.txt', tunnel3000.url);

        const tunnel4200 = await localtunnel({ port: 4200 });
        console.log('FRONTEND_URL_FOUND:' + tunnel4200.url);
        fs.writeFileSync('url_4200.txt', tunnel4200.url);

        console.log('--- TUNELES ACTIVOS ---');
        // Mantener el proceso vivo por un tiempo
        setTimeout(() => {
            console.log('Cerrando script (túneles persistirán si el proceso no muere)');
            process.exit(0);
        }, 15000);
    } catch (err) {
        console.error('ERROR_IN_TUNNEL:', err);
        process.exit(1);
    }
}

startTunnels();
