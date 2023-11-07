// src/server.ts

import * as http from 'http';
import * as url from 'url';
import { v4 as uuidv4 } from 'uuid';

interface ShortUrls {
  [key: string]: string;
}

const shortUrls: ShortUrls = {};

const requestHandler: http.RequestListener = (req, res) => {
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
        const id = uuidv4().slice(0, 8);
        shortUrls[id] = originalUrl;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ shortUrl: `http://localhost:8080/${id}` }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
  } else if (parsedUrl.pathname && parsedUrl.pathname.startsWith('/')) {
    // Обработка редиректа по короткому URL
    const id = parsedUrl.pathname.slice(1);
    const originalUrl = shortUrls[id];

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
};

const server = http.createServer(requestHandler);

server.listen(8080, () => {
  console.log(`Server is running at http://localhost:8080/`);
});
