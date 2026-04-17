const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const ports = [3000, 4200];
const urls = {};
const ltPath = path.join(__dirname, 'node_modules', 'localtunnel', 'bin', 'lt.js');

ports.forEach(port => {
    console.log(`Iniciando localtunnel para puerto ${port}...`);
    // Usamos node directamente para evitar problemas con npx y politicas de ejecucion
    const child = exec(`node "${ltPath}" --port ${port}`);

    child.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[LT Port ${port}] ${output.trim()}`);
        if (output.includes('https://')) {
            const url = output.match(/https:\/\/[^\s]+/)[0].trim();
            urls[port] = url;
            console.log(`URL CAPTURADA puerto ${port}:`, url);
            fs.writeFileSync('lt_urls.txt', JSON.stringify(urls, null, 2));
            // También guardamos en archivos individuales para facilitar lectura
            fs.writeFileSync(`url_${port}.txt`, url);
        }
    });

    child.stderr.on('data', (data) => {
        console.error(`LT Error (Port ${port}):`, data.toString());
    });
});

console.log('Script de captura iniciado. Esperando URLs...');
// El proceso ahora se mantendrá activo y no usará process.exit(0)
