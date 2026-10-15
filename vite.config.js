import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2Client = new S3Client({
  endpoint: 'https://a70d86b21360a62b32237371962c1f87.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: 'c9e3a3befa14625982f3a35ad83ac7d3',
    secretAccessKey: '7264cc2421ef8d27247ca49c1c4f4015c1c39185ad2609580433b6d184a84d09',
  },
  region: 'auto',
});

const R2_BUCKET = '4printdev';
const R2_PUBLIC_BASE = 'https://a70d86b21360a62b32237371962c1f87.r2.cloudflarestorage.com/4printdev';

function r2UploadPlugin() {
  return {
    name: 'r2-upload-service',
    configureServer(server) {
      // 1. Media proxy endpoint: streams private Cloudflare R2 objects directly to the browser
      server.middlewares.use('/r2-media', async (req, res, next) => {
        try {
          const rawKey = req.url.replace(/^\/+/, '').split('?')[0];
          if (!rawKey) return next();

          // Decode URL components in case key has special chars
          const key = decodeURIComponent(rawKey);

          const r2Response = await r2Client.send(
            new GetObjectCommand({
              Bucket: R2_BUCKET,
              Key: key,
            })
          );

          res.statusCode = 200;
          res.setHeader('Content-Type', r2Response.ContentType || 'image/jpeg');
          if (r2Response.ContentLength) {
            res.setHeader('Content-Length', r2Response.ContentLength);
          }
          res.setHeader('Cache-Control', 'public, max-age=604800');

          if (r2Response.Body && typeof r2Response.Body.pipe === 'function') {
            r2Response.Body.pipe(res);
          } else {
            const bytes = await r2Response.Body.transformToByteArray();
            res.end(Buffer.from(bytes));
          }
        } catch (err) {
          console.warn('R2 proxy fetch error for:', req.url, err.message);
          res.statusCode = 404;
          res.end('Image not found');
        }
      });

      // 2. Upload endpoint: uploads images directly to Cloudflare R2 and returns signed + public URLs
      server.middlewares.use('/api/upload-r2', (req, res, next) => {
        if (req.method !== 'POST') return next();

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const { fileName = 'image.jpg', contentType = 'image/jpeg', base64, folder = 'products' } = data;

            if (!base64) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'No image data provided' }));
              return;
            }

            // Strip data:image/...;base64, prefix if present
            const cleanBase64 = base64.replace(/^data:image\/[a-z0-9+.-]+;base64,/, '');
            const buffer = Buffer.from(cleanBase64, 'base64');

            const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
            const cleanName = fileName
              .replace(/\.[^/.]+$/, '')
              .replace(/[^a-zA-Z0-9_-]/g, '_')
              .substring(0, 50);

            const key = `${folder}/${Date.now()}_${cleanName}.${ext}`;

            // Put object in Cloudflare R2 bucket
            await r2Client.send(
              new PutObjectCommand({
                Bucket: R2_BUCKET,
                Key: key,
                Body: buffer,
                ContentType: contentType,
              })
            );

            // Generate signed URL (7-day validity) so it displays anywhere
            let signedUrl = '';
            try {
              signedUrl = await getSignedUrl(
                r2Client,
                new GetObjectCommand({
                  Bucket: R2_BUCKET,
                  Key: key,
                }),
                { expiresIn: 7 * 24 * 3600 }
              );
            } catch (signErr) {
              console.warn('Presigned URL generation warning:', signErr.message);
            }

            const publicUrl = `${R2_PUBLIC_BASE}/${key}`;

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: true,
                url: signedUrl || publicUrl,
                publicUrl,
                proxyUrl: `/r2-media/${key}`,
                key,
                size: buffer.length,
              })
            );
          } catch (err) {
            console.error('R2 upload middleware error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: false,
                error: err.message || 'Failed to upload to Cloudflare R2',
              })
            );
          }
        });
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    r2UploadPlugin(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/admin': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/categories': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
