import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const R2_BUCKET = process.env.R2_BUCKET_NAME || '4printdev';
const R2_ENDPOINT = process.env.R2_ENDPOINT || 'https://a70d86b21360a62b32237371962c1f87.r2.cloudflarestorage.com';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || 'c9e3a3befa14625982f3a35ad83ac7d3';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '7264cc2421ef8d27247ca49c1c4f4015c1c39185ad2609580433b6d184a84d09';

const r2Client = new S3Client({
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  region: 'auto',
});

export default async function handler(req, res) {
  let cleanKey = '';
  try {
    let rawKey = req.query?.key;
    if (Array.isArray(rawKey)) {
      rawKey = rawKey.join('/');
    }

    if (!rawKey && req.url) {
      const parsedUrl = new URL(req.url, 'http://localhost');
      rawKey = parsedUrl.searchParams.get('key') || parsedUrl.pathname.replace(/^\/(?:api\/)?r2-media\/?/, '');
    }

    if (!rawKey) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      return res.end('Image key is required');
    }

    // Clean leading slashes, decode URL, strip query params, and strip bucket prefix if present
    cleanKey = decodeURIComponent(rawKey).replace(/^\/+/, '').split('?')[0];
    cleanKey = cleanKey.replace(/^4printdev\//, '');

    const r2Response = await r2Client.send(
      new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: cleanKey,
      })
    );

    res.writeHead(200, {
      'Content-Type': r2Response.ContentType || 'image/jpeg',
      ...(r2Response.ContentLength ? { 'Content-Length': r2Response.ContentLength } : {}),
      'Cache-Control': 'public, max-age=604800, s-maxage=604800, immutable',
      'Access-Control-Allow-Origin': '*',
    });

    if (r2Response.Body && typeof r2Response.Body.pipe === 'function') {
      return r2Response.Body.pipe(res);
    }

    const bytes = await r2Response.Body.transformToByteArray();
    return res.end(Buffer.from(bytes));
  } catch (err) {
    console.error('R2 media proxy error for key:', cleanKey, err?.message);
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Image not found');
  }
}
