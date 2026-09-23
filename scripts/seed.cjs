const { MongoClient } = require('C:/Users/janar/Documents/New folder/4prints_backend/backend/node_modules/mongodb');
const bcrypt = require('C:/Users/janar/Documents/New folder/4prints_backend/backend/node_modules/bcrypt');

async function seedAdmin() {
  const uri = 'mongodb+srv://poovarasan4046:Poovarasan4046@tutoria.rwhbupe.mongodb.net/four_print?retryWrites=true&w=majority';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas...');
    const db = client.db('four_print');
    const col = db.collection('admins');

    const passwordHash = await bcrypt.hash('Admin@123456', 12);
    const now = new Date();

    const adminDoc = {
      name: 'Super Admin',
      email: 'admin@4prints.com',
      password: passwordHash,
      role: 'superadmin',
      tfaEnabled: false,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    const result = await col.updateOne(
      { email: 'admin@4prints.com' },
      { $set: adminDoc },
      { upsert: true }
    );

    console.log('Admin seeded successfully!', result);
    const admin = await col.findOne({ email: 'admin@4prints.com' });
    console.log('Verified Admin in DB:', {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      tfaEnabled: admin.tfaEnabled,
      hasPassword: Boolean(admin.password),
    });
  } finally {
    await client.close();
  }
}

seedAdmin().catch(console.error);
