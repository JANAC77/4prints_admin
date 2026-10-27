import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
      return res.status(400).send('Image key is required');
    }

    // Clean leading slashes and any query parameters
    const cleanKey = decodeURIComponent(rawKey).replace(/^\/+/, '').split('?')[0];

    // Generate fresh presigned URL valid for 24 hours
    const signedUrl = await getSignedUrl(
      r2Client,
      new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: cleanKey,
      }),
      { expiresIn: 86400 } // 24 hours
    );

    // Redirect browser directly to Cloudflare R2 signed URL with caching
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    return res.redirect(302, signedUrl);
  } catch (err) {
    console.error('R2 media proxy error:', err);
    return res.status(404).send('Image not found');
  }
}
