// tests/server.test.ts

import request from 'supertest';
import { createServer } from '../src/server';
import * as http from 'http';

describe('/shorten endpoint', () => {
    let server: http.Server;

    beforeAll(() => {
      server = createServer(); 
      server.listen(8080);
    });
  
    afterAll((done) => {
      server.close(done); 
    });

  it('should shorten a valid URL', async () => {
    const response = await request(server)
      .post('/shorten')
      .send({ url: 'https://www.example.com' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('shortUrl');
  });

  it('should return an error for invalid URL', async () => {
    const response = await request(server)
      .post('/shorten')
      .send({ url: 'not-a-valid-url' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should allow custom slugs', async () => {
    const customSlug = 'my-custom-slug';
    const response = await request(server)
      .post('/shorten')
      .send({ url: 'https://www.example.com', slug: customSlug });

    expect(response.status).toBe(200);
    expect(response.body.shortUrl).toContain(customSlug);
  });

  it('should redirect to the original URL', async () => {
    const customSlug = 'my-redirect-slug';
    const originalUrl = 'https://www.example.com';

    let response = await request(server)
      .post('/shorten')
      .send({ url: originalUrl, slug: customSlug });

    expect(response.status).toBe(200);

    response = await request(server)
      .get(`/${customSlug}`)
      .redirects(0);

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(originalUrl);
  });

});
