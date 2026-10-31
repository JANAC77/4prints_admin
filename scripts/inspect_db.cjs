const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://poovarasan4046:Poovarasan4046@tutoria.rwhbupe.mongodb.net/four_print?retryWrites=true&w=majority';

async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  console.log('Connected to MongoDB Atlas successfully!');
  const db = client.db('four_print');
  
  const cats = await db.collection('categories').find().toArray();
  console.log('=== CATEGORIES (' + cats.length + ') ===');
  cats.forEach(c => console.log('CAT:', c._id, '| name:', c.name, '| image:', c.image));

  const subs = await db.collection('subcategories').find().toArray();
  console.log('\n=== SUBCATEGORIES (' + subs.length + ') ===');
  subs.forEach(s => console.log('SUB:', s._id, '| name:', s.name, '| catId:', s.categoryId, '| image:', s.image));

  const prods = await db.collection('products').find().toArray();
  console.log('\n=== PRODUCTS (' + prods.length + ') ===');
  prods.forEach(p => console.log('PROD:', p._id, '| name:', p.name, '| cat:', p.category, '| sub:', p.subCategory, '| img0:', p.images?.[0]?.url));

  await client.close();
}

run().catch(console.error);
