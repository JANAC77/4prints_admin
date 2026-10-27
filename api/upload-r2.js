import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_BUCKET = process.env.R2_BUCKET_NAME || '4printdev';
const R2_ENDPOINT = process.env.R2_ENDPOINT || 'https://a70d86b21360a62b32237371962c1f87.r2.cloudflarestorage.com';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || 'c9e3a3befa14625982f3a35ad83ac7d3';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '7264cc2421ef8d27247ca49c1c4f4015c1c39185ad2609580433b6d184a84d09';
const R2_PUBLIC_BASE = 'https://a70d86b21360a62b32237371962c1f87.r2.cloudflarestorage.com/4printdev';

const r2Client = new S3Client({
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  region: 'auto',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { fileName = 'image.jpg', contentType = 'image/jpeg', base64, folder = 'products' } = data || {};

    if (!base64) {
      return res.status(400).json({ success: false, error: 'No image data provided' });
    }

    const cleanBase64 = base64.replace(/^data:image\/[a-z0-9+.-]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanName = fileName
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 50);

    const key = `${folder}/${Date.now()}_${cleanName}.${ext}`;

    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );

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
      console.warn('Presigned URL warning:', signErr.message);
    }

    const publicUrl = `${R2_PUBLIC_BASE}/${key}`;

    return res.status(200).json({
      success: true,
      url: signedUrl || publicUrl,
      publicUrl,
      proxyUrl: `/r2-media/${key}`,
      key,
      size: buffer.length,
    });
  } catch (err) {
    console.error('R2 upload handler error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to upload to Cloudflare R2' });
  }
}
