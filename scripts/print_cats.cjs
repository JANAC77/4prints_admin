const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://poovarasan4046:Poovarasan4046@tutoria.rwhbupe.mongodb.net/four_print?retryWrites=true&w=majority';

async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('four_print');
  
  const cats = await db.collection('categories').find().toArray();
  for (const c of cats) {
    console.log({
      _id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      image: c.image ? c.image.substring(0, 100) + '...' : null
    });
  }

  await client.close();
}

run().catch(console.error);

