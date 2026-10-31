const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://poovarasan4046:Poovarasan4046@tutoria.rwhbupe.mongodb.net/four_print?retryWrites=true&w=majority';

(async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('four_print');

  console.log('--- 5 Categories ---');
  const cats = await db.collection('categories').find({
    slug: { $in: ['visiting-cards', 'custom-tshirts-apparel', 'personalized-mugs-drinkware', 'marketing-flyers-brochures', 'banners-posters-standees'] }
  }).toArray();
  cats.forEach(c => console.log('✓', c.name, '->', c.image ? c.image.substring(0, 90) + '...' : 'none'));

  console.log('\n--- 5 Subcategories ---');
  const subs = await db.collection('subcategories').find({
    slug: { $in: ['standard-visiting-cards', 'round-neck-cotton-t-shirts', 'ceramic-coffee-mugs', 'promotional-flyers-leaflets', 'rollup-display-standees'] }
  }).toArray();
  subs.forEach(s => console.log('✓', s.name, '->', s.image ? s.image.substring(0, 90) + '...' : 'none'));

  console.log('\n--- 5 Products ---');
  const prods = await db.collection('products').find({
    sku: { $regex: '^VP-' }
  }).toArray();
  prods.forEach(p => console.log('✓', p.name, '(' + p.sku + ') ->', p.images?.[0]?.url ? p.images[0].url.substring(0, 90) + '...' : 'none'));

  await client.close();
})();

