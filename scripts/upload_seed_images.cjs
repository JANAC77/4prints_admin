const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { MongoClient } = require('mongodb');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const MONGODB_URI = 'mongodb+srv://poovarasan4046:Poovarasan4046@tutoria.rwhbupe.mongodb.net/four_print?retryWrites=true&w=majority';
const R2_ENDPOINT = 'https://a70d86b21360a62b32237371962c1f87.r2.cloudflarestorage.com';
const R2_ACCESS_KEY_ID = 'c9e3a3befa14625982f3a35ad83ac7d3';
const R2_SECRET_ACCESS_KEY = '7264cc2421ef8d27247ca49c1c4f4015c1c39185ad2609580433b6d184a84d09';
const R2_BUCKET = '4printdev';
const R2_PUBLIC_BASE = 'https://a70d86b21360a62b32237371962c1f87.r2.cloudflarestorage.com/4printdev';

const r2Client = new S3Client({
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  region: 'auto',
});

// Seed items definitions with high-resolution photography URLs
const items = [
  // 1. Categories
  {
    type: 'categories',
    slug: 'visiting-cards',
    name: 'Visiting Cards',
    filename: 'visiting-cards.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1000&auto=format&fit=crop&q=85',
  },
  {
    type: 'categories',
    slug: 'custom-tshirts-apparel',
    name: 'Custom T-Shirts & Apparel',
    filename: 'custom-tshirts-apparel.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000&auto=format&fit=crop&q=85',
  },
  {
    type: 'categories',
    slug: 'personalized-mugs-drinkware',
    name: 'Personalized Mugs & Drinkware',
    filename: 'personalized-mugs-drinkware.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1000&auto=format&fit=crop&q=85',
  },
  {
    type: 'categories',
    slug: 'marketing-flyers-brochures',
    name: 'Marketing Flyers & Brochures',
    filename: 'marketing-flyers-brochures.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1000&auto=format&fit=crop&q=85',
  },
  {
    type: 'categories',
    slug: 'banners-posters-standees',
    name: 'Banners, Posters & Standees',
    filename: 'banners-posters-standees.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1000&auto=format&fit=crop&q=85',
  },

  // 2. Subcategories
  {
    type: 'subcategories',
    slug: 'standard-visiting-cards',
    name: 'Standard Visiting Cards',
    filename: 'standard-visiting-cards.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1000&auto=format&fit=crop&q=85',
  },
  {
    type: 'subcategories',
    slug: 'round-neck-cotton-t-shirts',
    name: 'Round Neck Cotton T-Shirts',
    filename: 'round-neck-cotton-t-shirts.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1000&auto=format&fit=crop&q=85',
  },
  {
    type: 'subcategories',
    slug: 'ceramic-coffee-mugs',
    name: 'Ceramic Coffee Mugs',
    filename: 'ceramic-coffee-mugs.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=1000&auto=format&fit=crop&q=85',
  },
  {
    type: 'subcategories',
    slug: 'promotional-flyers-leaflets',
    name: 'Promotional Flyers & Leaflets',
    filename: 'promotional-flyers-leaflets.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1000&auto=format&fit=crop&q=85',
  },
  {
    type: 'subcategories',
    slug: 'rollup-display-standees',
    name: 'Roll-Up Display Standees',
    filename: 'rollup-display-standees.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1000&auto=format&fit=crop&q=85',
  },

  // 3. Products
  {
    type: 'products',
    slug: 'classic-350-gsm-matte-visiting-cards',
    sku: 'VP-BC-MATTE-350',
    name: 'Classic 350 GSM Matte Visiting Cards',
    filename: 'classic-350-gsm-matte-visiting-cards.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1000&auto=format&fit=crop&q=85',
  },
  {
    type: 'products',
    slug: 'custom-branded-bio-washed-cotton-tshirt',
    sku: 'VP-TSHIRT-COTTON-180',
    name: 'Custom Branded Bio-Washed Cotton T-Shirt',
    filename: 'custom-branded-bio-washed-cotton-t-shirt.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000&auto=format&fit=crop&q=85',
  },
  {
    type: 'products',
    slug: 'personalized-ceramic-photo-coffee-mug',
    sku: 'VP-MUG-CERAMIC-325',
    name: 'Personalized Ceramic Photo Coffee Mug (325ml)',
    filename: 'personalized-ceramic-photo-coffee-mug.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1000&auto=format&fit=crop&q=85',
  },
  {
    type: 'products',
    slug: 'gloss-art-paper-promotional-flyers-a5',
    sku: 'VP-FLYER-GLOSS-A5',
    name: 'Gloss Art Paper Promotional Flyers (A5)',
    filename: 'gloss-art-paper-promotional-flyers.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1000&auto=format&fit=crop&q=85',
  },
  {
    type: 'products',
    slug: 'retractable-rollup-banner-standee',
    sku: 'VP-BANNER-ROLLUP-6X25',
    name: 'Retractable Roll-Up Banner Standee (6ft x 2.5ft)',
    filename: 'retractable-roll-up-banner-standee.jpg',
    sourceUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1000&auto=format&fit=crop&q=85',
  },
];

// Helper to download image to local buffer
function downloadToBuffer(url) {
  return new Promise((resolve, reject) => {
    const getter = url.startsWith('https') ? https : http;
    getter.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadToBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download: HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  console.log('=== Step 1: Downloading & Saving Images Locally ===\n');

  const baseLocalDir = path.join(__dirname, '..', 'local_assets', 'seed_images');
  const basePublicDir = path.join(__dirname, '..', 'public', 'seed_images');

  ['categories', 'subcategories', 'products'].forEach((sub) => {
    fs.mkdirSync(path.join(baseLocalDir, sub), { recursive: true });
    fs.mkdirSync(path.join(basePublicDir, sub), { recursive: true });
  });

  const processed = [];

  for (const item of items) {
    const localFilePath = path.join(baseLocalDir, item.type, item.filename);
    const publicFilePath = path.join(basePublicDir, item.type, item.filename);

    console.log(`[LOCAL] Downloading image for ${item.type} "${item.name}"...`);
    try {
      const buffer = await downloadToBuffer(item.sourceUrl);
      fs.writeFileSync(localFilePath, buffer);
      fs.writeFileSync(publicFilePath, buffer);
      console.log(`  -> Saved locally to: ${localFilePath} (${buffer.length} bytes)`);
      processed.push({ ...item, buffer, localFilePath });
    } catch (err) {
      console.warn(`  -> Download warning for ${item.name}: ${err.message}. Using fallback.`);
      if (fs.existsSync(localFilePath)) {
        const buffer = fs.readFileSync(localFilePath);
        processed.push({ ...item, buffer, localFilePath });
      }
    }
  }

  console.log(`\nSuccessfully saved ${processed.length} images locally!\n`);

  console.log('=== Step 2: Uploading Local Images to Cloudflare R2 ===\n');

  const uploadResults = [];

  for (const item of processed) {
    // Key format matches backend standard: `${type}/${slug}/image.jpg`
    const r2Key = `${item.type}/${item.slug}/image.jpg`;

    console.log(`[R2 UPLOAD] Uploading local file "${item.filename}" to key "${r2Key}"...`);

    // Read directly from disk
    const fileBuffer = fs.readFileSync(item.localFilePath);

    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: r2Key,
        Body: fileBuffer,
        ContentType: 'image/jpeg',
      })
    );

    // Generate 7-day signed URL (same as backend r2.storage.ts)
    let signedUrl = '';
    try {
      signedUrl = await getSignedUrl(
        r2Client,
        new GetObjectCommand({
          Bucket: R2_BUCKET,
          Key: r2Key,
        }),
        { expiresIn: 7 * 24 * 3600 }
      );
    } catch (e) {
      console.warn('Presigned url warning:', e.message);
    }

    const publicUrl = `${R2_PUBLIC_BASE}/${r2Key}`;
    const finalUrl = signedUrl || publicUrl;

    console.log(`  -> Uploaded! Key: ${r2Key}`);
    uploadResults.push({
      ...item,
      r2Key,
      signedUrl,
      publicUrl,
      finalUrl,
    });
  }

  console.log('\n=== Step 3: Updating MongoDB Database with Uploaded Image URLs ===\n');

  const mongoClient = new MongoClient(MONGODB_URI);
  await mongoClient.connect();
  const db = mongoClient.db('four_print');

  let catUpdated = 0;
  let subUpdated = 0;
  let prodUpdated = 0;

  for (const res of uploadResults) {
    if (res.type === 'categories') {
      const updateResult = await db.collection('categories').updateOne(
        { slug: res.slug },
        {
          $set: {
            image: res.finalUrl,
            updatedAt: new Date(),
          },
        }
      );
      if (updateResult.matchedCount > 0) {
        console.log(`Updated Category "${res.name}" image URL in MongoDB`);
        catUpdated++;
      }
    } else if (res.type === 'subcategories') {
      const updateResult = await db.collection('subcategories').updateOne(
        { slug: res.slug },
        {
          $set: {
            image: res.finalUrl,
            updatedAt: new Date(),
          },
        }
      );
      if (updateResult.matchedCount > 0) {
        console.log(`Updated Subcategory "${res.name}" image URL in MongoDB`);
        subUpdated++;
      }
    } else if (res.type === 'products') {
      const filter = res.sku ? { $or: [{ sku: res.sku }, { slug: res.slug }] } : { slug: res.slug };
      const updateResult = await db.collection('products').updateOne(
        filter,
        {
          $set: {
            'images.0.url': res.finalUrl,
            updatedAt: new Date(),
          },
        }
      );
      if (updateResult.matchedCount > 0) {
        console.log(`Updated Product "${res.name}" image URL in MongoDB`);
        prodUpdated++;
      }
    }
  }

  await mongoClient.close();

  console.log('\n=== SUMMARY ===');
  console.log(`- Local images created: ${processed.length}`);
  console.log(`- Files uploaded to Cloudflare R2: ${uploadResults.length}`);
  console.log(`- MongoDB Categories updated: ${catUpdated}`);
  console.log(`- MongoDB Subcategories updated: ${subUpdated}`);
  console.log(`- MongoDB Products updated: ${prodUpdated}`);
  console.log('\nAll seeded images generated locally, uploaded to R2, and saved to MongoDB successfully!');
}

main().catch((err) => {
  console.error('Fatal error in upload_seed_images:', err);
  process.exit(1);
});

