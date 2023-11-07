"use strict";
// src/server.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("http"));
const url = __importStar(require("url"));
const uuid_1 = require("uuid");
const shortUrls = {};
const requestHandler = (req, res) => {
    const parsedUrl = url.parse(req.url || '', true);
    if (parsedUrl.pathname === '/shorten' && req.method === 'POST') {
        // Обработка сокращения URL
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
        req.on('end', () => {
            try {
                const originalUrl = JSON.parse(body).url;
                const id = (0, uuid_1.v4)().slice(0, 8);
                shortUrls[id] = originalUrl;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ shortUrl: `http://localhost:8080/${id}` }));
            }
            catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid request' }));
            }
        });
    }
    else if (parsedUrl.pathname && parsedUrl.pathname.startsWith('/')) {
        // Обработка редиректа по короткому URL
        const id = parsedUrl.pathname.slice(1);
        const originalUrl = shortUrls[id];
        if (originalUrl) {
            res.writeHead(302, { Location: originalUrl });
            res.end();
        }
        else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Short URL not found' }));
        }
    }
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Endpoint not found' }));
    }
};
const server = http.createServer(requestHandler);
server.listen(8080, () => {
    console.log(`Server is running at http://localhost:8080/`);
});
//# sourceMappingURL=server.js.map