// Servidor de intercambio de códigos para SaintVortex
// Solo guarda códigos temporalmente para facilitar conexión entre peers

const http = require('http');
const PORT = process.env.PORT || 3000;

// Almacenamiento temporal de códigos (en memoria)
// Formato: { codigo: { virtualIP, publicIP, timestamp } }
const codes = new Map();

// Limpiar códigos viejos cada 5 minutos
setInterval(() => {
    const now = Date.now();
    const EXPIRY = 30 * 60 * 1000; // 30 minutos
    
    for (const [code, data] of codes.entries()) {
        if (now - data.timestamp > EXPIRY) {
            codes.delete(code);
            console.log(`[CLEANUP] Código expirado: ${code}`);
        }
    }
}, 5 * 60 * 1000);

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // POST /register - Registrar código
    if (req.method === 'POST' && url.pathname === '/register') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const { code, virtualIP, publicIP } = data;
                
                if (!code || !virtualIP || !publicIP) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing required fields' }));
                    return;
                }
                
                codes.set(code, {
                    virtualIP,
                    publicIP,
                    timestamp: Date.now()
                });
                
                console.log(`[REGISTER] ${code} -> ${virtualIP} (${publicIP})`);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, code }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }
    
    // GET /lookup?code=XXX - Buscar código
    if (req.method === 'GET' && url.pathname === '/lookup') {
        const code = url.searchParams.get('code');
        
        if (!code) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing code parameter' }));
            return;
        }
        
        const data = codes.get(code);
        
        if (!data) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Code not found or expired' }));
            return;
        }
        
        console.log(`[LOOKUP] ${code} -> ${data.virtualIP} (${data.publicIP})`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            virtualIP: data.virtualIP,
            publicIP: data.publicIP
        }));
    }
    
    // GET /stats - Estadísticas
    else if (req.method === 'GET' && url.pathname === '/stats') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            activeCodes: codes.size,
            uptime: process.uptime()
        }));
    }
    
    // GET / - Health check
    else if (req.method === 'GET' && url.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('SaintVortex Exchange Server - Running');
    }
    
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

server.listen(PORT, () => {
    console.log('🔄 SaintVortex Exchange Server');
    console.log(`📡 Listening on port ${PORT}`);
    console.log(`🌐 Ready to exchange peer codes`);
});
