import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

function goodreadsProxyPlugin() {
  return {
    name: 'goodreads-proxy',
    configureServer(server) {
      server.middlewares.use('/api/proxy', async (req, res) => {
        try {
          const urlObj = new URL(req.url, 'http://localhost');
          const targetUrl = urlObj.searchParams.get('url');
          if (!targetUrl) {
            res.statusCode = 400;
            return res.end('Missing url parameter');
          }
          const response = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Accept': 'application/xml, text/xml, */*',
            },
          });
          const text = await response.text();
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.statusCode = response.status;
          res.end(text);
        } catch (err) {
          res.statusCode = 500;
          res.end(err.message);
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: './', // Ensures relative assets work on GitHub Pages out of the box
  plugins: [react(), tailwindcss(), goodreadsProxyPlugin()],
})
