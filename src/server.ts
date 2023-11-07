// src/server.ts

import * as http from 'http';
import * as url from 'url';
import { StringDecoder } from 'string_decoder';

const shortUrls: Record<string, string> = {};

const isValidUrl = (urlString: string): boolean => {
    try {
        new URL(urlString);
        return true;
    } catch (err) {
        return false;
    }
};

const requestHandler: http.RequestListener = (req, res) => {
    const parsedUrl = url.parse(req.url || '', true);
    const decoder = new StringDecoder('utf-8');
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
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid request body' }));
            }
        } else if (parsedUrl.pathname) {

            const path = parsedUrl.pathname.slice(1);
            const originalUrl = shortUrls[path];

            if (originalUrl) {
                res.writeHead(302, { Location: originalUrl });
                res.end();
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Short URL not found' }));
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Endpoint not found' }));
        }
    });
};

export const createServer = () => {
    return http.createServer(requestHandler);
};
if (require.main === module) {
    const server = createServer();
    server.listen(8080, () => {
        console.log(`Server is running at http://localhost:8080/`);
    });
}

