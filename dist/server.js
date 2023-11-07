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
exports.createServer = void 0;
const http = __importStar(require("http"));
const url = __importStar(require("url"));
const string_decoder_1 = require("string_decoder");
const shortUrls = {};
const isValidUrl = (urlString) => {
    try {
        new URL(urlString);
        return true;
    }
    catch (err) {
        return false;
    }
};
const requestHandler = (req, res) => {
    const parsedUrl = url.parse(req.url || '', true);
    const decoder = new string_decoder_1.StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });
    req.on('end', () => {
        buffer += decoder.end();
        if (parsedUrl.pathname === '/shorten' && req.method === 'POST') {
            try {
                const { url: originalUrl, slug } = JSON.parse(buffer);
                if (!isValidUrl(originalUrl)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid URL' }));
                    return;
                }
                const id = slug || Math.random().toString(36).substr(2, 8);
                shortUrls[id] = originalUrl;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ shortUrl: `http://${req.headers.host}/${id}` }));
            }
            catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid request body' }));
            }
        }
        else if (parsedUrl.pathname) {
            const path = parsedUrl.pathname.slice(1);
            const originalUrl = shortUrls[path];
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
    });
};
const createServer = () => {
    return http.createServer(requestHandler);
};
exports.createServer = createServer;
if (require.main === module) {
    const server = (0, exports.createServer)();
    server.listen(8080, () => {
        console.log(`Server is running at http://localhost:8080/`);
    });
}
//# sourceMappingURL=server.js.map