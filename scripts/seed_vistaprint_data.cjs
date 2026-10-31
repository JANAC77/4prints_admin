const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://poovarasan4046:Poovarasan4046@tutoria.rwhbupe.mongodb.net/four_print?retryWrites=true&w=majority';

// 5 Official Vistaprint-style Top Categories
const vistaprintCategories = [
  {
    name: 'Visiting Cards',
    slug: 'visiting-cards',
    description: 'Custom visiting cards and business cards in premium matte, glossy, velvet touch, and metallic foil finishes.',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    name: 'Custom T-Shirts & Apparel',
    slug: 'custom-tshirts-apparel',
    description: 'Personalized corporate t-shirts, polo shirts, hoodies, and caps with embroidery and screen printing.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    name: 'Personalized Mugs & Drinkware',
    slug: 'personalized-mugs-drinkware',
    description: 'Custom ceramic photo coffee mugs, insulated water bottles, travel sippers, and corporate drinkware.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    name: 'Marketing Flyers & Brochures',
    slug: 'marketing-flyers-brochures',
    description: 'Full color promotional flyers, leaflets, bi-fold and tri-fold brochures for business promotion.',
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    name: 'Banners, Posters & Standees',
    slug: 'banners-posters-standees',
    description: 'Durable outdoor vinyl flex banners, retractable roll-up standees, posters, and retail signage.',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
];

// 5 Subcategories corresponding to the 5 categories
const vistaprintSubcategories = [
  {
    categorySlug: 'visiting-cards',
    name: 'Standard Visiting Cards',
    slug: 'standard-visiting-cards',
    description: 'Premium 350 GSM matte and glossy visiting cards for daily networking and professional branding.',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    categorySlug: 'custom-tshirts-apparel',
    name: 'Round Neck Cotton T-Shirts',
    slug: 'round-neck-cotton-t-shirts',
    description: '100% combed cotton crew neck t-shirts bio-washed for superior softness and rich color retention.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    categorySlug: 'personalized-mugs-drinkware',
    name: 'Ceramic Coffee Mugs',
    slug: 'ceramic-coffee-mugs',
    description: 'Glossy ceramic 325ml mugs with full wraparound dye-sublimation photo printing.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    categorySlug: 'marketing-flyers-brochures',
    name: 'Promotional Flyers & Leaflets',
    slug: 'promotional-flyers-leaflets',
    description: 'Single and double-sided A4 and A5 flyers printed on premium 130 GSM glossy art paper.',
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    categorySlug: 'banners-posters-standees',
    name: 'Roll-Up Display Standees',
    slug: 'rollup-display-standees',
    description: 'Portable retractable pull-up banner stands with lightweight aluminum cassette and carry bag.',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
];

// 5 Products matching the 5 subcategories
const vistaprintProducts = [
  {
    categorySlug: 'visiting-cards',
    subcategorySlug: 'standard-visiting-cards',
    name: 'Classic 350 GSM Matte Visiting Cards',
    slug: 'classic-350-gsm-matte-visiting-cards',
    sku: 'VP-BC-MATTE-350',
    shortDescription: 'Smooth non-reflective 350 GSM European cardstock with crisp color fidelity.',
    description: 'Our best-selling visiting cards crafted on heavy 350 GSM art cardstock with double-sided matte thermal lamination. Perfect for entrepreneurs, professionals, and corporate executives who want a sophisticated, finger-print resistant finish.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
        alt: 'Classic Matte Visiting Cards Stack',
      },
      {
        url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800&auto=format&fit=crop&q=80',
        alt: 'Matte Card Close-up Detail',
      },
    ],
    highlights: [
      '350 GSM Premium European Heavyweight Cardstock',
      'Anti-scuff Matte Thermal Coating on both sides',
      'High-Definition 2400 DPI Digital Offset Print',
      'Standard 89mm x 51mm (3.5" x 2") Dimensions',
    ],
    variants: [
      {
        name: 'Corner Style',
        type: 'radio',
        values: [
          { label: 'Standard Square Corners', value: 'square' },
          { label: '3mm Rounded Corners', value: 'rounded' },
        ],
      },
      {
        name: 'Print Sides',
        type: 'dropdown',
        values: [
          { label: 'Single Sided Print', value: 'single' },
          { label: 'Double Sided Full Color', value: 'double' },
        ],
      },
    ],
    pricing: [
      { quantity: 100, price: 249, discount: 0 },
      { quantity: 250, price: 499, discount: 15 },
      { quantity: 500, price: 899, discount: 25 },
      { quantity: 1000, price: 1599, discount: 35 },
    ],
    minimumOrder: 100,
    allowDesignUpload: true,
    designInstructions: 'Please upload artwork in PDF, AI, or high-res PNG (300+ DPI). Keep critical text 3mm inside the cut margin with 2mm outer bleed.',
    specifications: [
      { title: 'Paper Weight', value: '350 GSM Art Board' },
      { title: 'Dimensions', value: '89 mm x 51 mm' },
      { title: 'Finish', value: 'Silky Matte Thermal Laminate' },
      { title: 'Turnaround Time', value: '24 - 48 Hours' },
    ],
    templates: [
      { title: 'Standard PDF Bleed Template', image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200', file: 'https://example.com/template-bc.pdf' }
    ],
    faqs: [
      { question: 'Can I write on these matte cards with a ballpoint pen?', answer: 'Yes, ballpoint pens and permanent markers write smoothly without smudging.' },
      { question: 'Are double-sided prints included?', answer: 'You can choose between single-sided or double-sided full color printing.' },
    ],
    relatedProducts: [],
    frequentlyBought: [],
    tags: ['visiting cards', 'business cards', 'matte', 'corporate', 'vistaprint'],
    metaTitle: 'Classic Matte Visiting Cards Online | 4Prints',
    metaDescription: 'Order high quality 350 GSM matte visiting cards with fast delivery.',
    keywords: ['visiting card', 'business card', 'matte visiting cards', 'online printing'],
    rating: { average: 4.9, totalReviews: 128 },
    status: { featured: true, bestSeller: true, newArrival: false, active: true },
  },
  {
    categorySlug: 'custom-tshirts-apparel',
    subcategorySlug: 'round-neck-cotton-t-shirts',
    name: 'Custom Branded Bio-Washed Cotton T-Shirt',
    slug: 'custom-branded-bio-washed-cotton-tshirt',
    sku: 'VP-TSHIRT-COTTON-180',
    shortDescription: '180 GSM pre-shrunk combed cotton t-shirt with vibrant full-color printing.',
    description: 'Comfortable, durable, and stylish 180 GSM combed ring-spun cotton t-shirt personalized with your company logo or custom graphics using high-definition, wash-durable Direct-to-Film (DTF) technology.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
        alt: 'Black Branded Cotton T-Shirt',
      },
      {
        url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
        alt: 'White Cotton T-Shirt Front View',
      },
    ],
    highlights: [
      '100% Combed Ring-Spun Cotton',
      '180 GSM Bio-Washed Soft Touch Fabric',
      'Fade-Resistant DTF Digital Color Print',
      'Available from XS to 3XL Unisex Sizes',
    ],
    variants: [
      {
        name: 'Size',
        type: 'dropdown',
        values: [
          { label: 'S (38")', value: 'S' },
          { label: 'M (40")', value: 'M' },
          { label: 'L (42")', value: 'L' },
          { label: 'XL (44")', value: 'XL' },
          { label: 'XXL (46")', value: 'XXL' },
        ],
      },
      {
        name: 'Color',
        type: 'color',
        values: [
          { label: 'Jet Black', value: '#111111' },
          { label: 'Crisp White', value: '#ffffff' },
          { label: 'Navy Blue', value: '#1e3a8a' },
          { label: 'Heather Grey', value: '#9ca3af' },
        ],
      },
    ],
    pricing: [
      { quantity: 1, price: 449, discount: 0 },
      { quantity: 5, price: 1999, discount: 11 },
      { quantity: 20, price: 6999, discount: 22 },
      { quantity: 50, price: 14999, discount: 33 },
    ],
    minimumOrder: 1,
    allowDesignUpload: true,
    designInstructions: 'Upload transparent PNG or SVG vector files. Minimum recommended resolution is 300 DPI.',
    specifications: [
      { title: 'Material', value: '100% Super Combed Cotton' },
      { title: 'Fabric Weight', value: '180 GSM' },
      { title: 'Wash Care', value: 'Machine wash cold inside out, do not iron on print' },
      { title: 'Fit Type', value: 'Regular Unisex Fit' },
    ],
    templates: [],
    faqs: [
      { question: 'Will the print fade after machine washing?', answer: 'Our DTF prints withstand 50+ washes without cracking or fading.' },
      { question: 'Can I print on both the front chest and the back?', answer: 'Yes, dual-side customization is fully supported.' },
    ],
    relatedProducts: [],
    frequentlyBought: [],
    tags: ['t-shirts', 'apparel', 'custom clothing', 'corporate wear', 'vistaprint'],
    metaTitle: 'Custom Printed Bio-Washed T-Shirts | 4Prints',
    metaDescription: 'Order high quality custom printed round neck cotton t-shirts online.',
    keywords: ['custom t-shirt', 'printed t-shirt', 'corporate apparel', 'cotton t-shirts'],
    rating: { average: 4.8, totalReviews: 95 },
    status: { featured: true, bestSeller: true, newArrival: false, active: true },
  },
  {
    categorySlug: 'personalized-mugs-drinkware',
    subcategorySlug: 'ceramic-coffee-mugs',
    name: 'Personalized Ceramic Photo Coffee Mug (325ml)',
    slug: 'personalized-ceramic-photo-coffee-mug',
    sku: 'VP-MUG-CERAMIC-325',
    shortDescription: 'Microwave and dishwasher safe glossy white ceramic mug with full wraparound photo print.',
    description: 'Start every morning with your favorite memories or brand logo on our 325ml ceramic mug. Printed with thermal dye-sublimation for radiant, permanent, fade-resistant color that lasts.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
        alt: 'Personalized White Ceramic Coffee Mug',
      },
      {
        url: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800&auto=format&fit=crop&q=80',
        alt: 'Ceramic Mug Print Close-up',
      },
    ],
    highlights: [
      '325 ml (11 oz) Premium Ceramic Mug',
      '100% Microwave and Dishwasher Safe',
      'Vibrant Full Wraparound Dye-Sublimation Print',
      'Ergonomic C-Handle with Glossy Enamel Glaze',
    ],
    variants: [
      {
        name: 'Inside & Handle Color',
        type: 'dropdown',
        values: [
          { label: 'All White Classic', value: 'white' },
          { label: 'Black Inner & Handle', value: 'black' },
          { label: 'Yellow Inner & Handle', value: 'yellow' },
          { label: 'Red Inner & Handle', value: 'red' },
        ],
      },
    ],
    pricing: [
      { quantity: 1, price: 299, discount: 0 },
      { quantity: 6, price: 1499, discount: 16 },
      { quantity: 24, price: 4999, discount: 30 },
      { quantity: 100, price: 16999, discount: 43 },
    ],
    minimumOrder: 1,
    allowDesignUpload: true,
    designInstructions: 'Recommended artwork dimensions are 200mm x 95mm at 300 DPI.',
    specifications: [
      { title: 'Capacity', value: '325 ml (11 oz)' },
      { title: 'Material', value: 'High-Grade AAA Ceramic' },
      { title: 'Print Area', value: 'Wraparound 20cm x 9.5cm' },
      { title: 'Packaging', value: 'Protective Thermocol & Kraft Box' },
    ],
    templates: [],
    faqs: [
      { question: 'Is the mug safe for microwave ovens?', answer: 'Yes, high-grade ceramic and sublimation dyes are 100% microwave safe.' },
    ],
    relatedProducts: [],
    frequentlyBought: [],
    tags: ['mugs', 'personalized gifts', 'ceramic mug', 'drinkware', 'vistaprint'],
    metaTitle: 'Custom Photo Coffee Mugs Online | 4Prints',
    metaDescription: 'Personalize ceramic coffee mugs with photos and company logos.',
    keywords: ['photo mug', 'custom mug', 'coffee mug printing', 'personalized gift'],
    rating: { average: 4.9, totalReviews: 210 },
    status: { featured: true, bestSeller: true, newArrival: true, active: true },
  },
  {
    categorySlug: 'marketing-flyers-brochures',
    subcategorySlug: 'promotional-flyers-leaflets',
    name: 'Gloss Art Paper Promotional Flyers (A5)',
    slug: 'gloss-art-paper-promotional-flyers-a5',
    sku: 'VP-FLYER-GLOSS-A5',
    shortDescription: '130 GSM high-gloss vibrant full-color advertising leaflets in A5 size.',
    description: 'Promote your promotional campaigns, retail sales, event flyers, or menu specials with crisp, high-gloss A5 leaflets. Printed on premium 130 GSM art paper with radiant colors and sharp image details.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80',
        alt: 'A5 Glossy Promotional Flyers Stack',
      },
      {
        url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80',
        alt: 'Flyer Presentation Sample',
      },
    ],
    highlights: [
      '130 GSM Premium Gloss Art Paper',
      'Standard A5 Size (148 x 210 mm)',
      'High-Speed Digital Offset Color Print',
      'Single or Double-Sided Full Color Available',
    ],
    variants: [
      {
        name: 'Sides',
        type: 'dropdown',
        values: [
          { label: 'Single Sided Print', value: 'single' },
          { label: 'Double Sided Full Color', value: 'double' },
        ],
      },
    ],
    pricing: [
      { quantity: 100, price: 499, discount: 0 },
      { quantity: 250, price: 899, discount: 20 },
      { quantity: 500, price: 1499, discount: 33 },
      { quantity: 1000, price: 2399, discount: 46 },
    ],
    minimumOrder: 100,
    allowDesignUpload: true,
    designInstructions: 'Submit files in PDF, AI, or 300+ DPI JPG. Maintain a 3mm safety margin and 2mm outer bleed.',
    specifications: [
      { title: 'Paper Stock', value: '130 GSM Gloss Finish' },
      { title: 'Dimensions', value: '148 mm x 210 mm (A5)' },
      { title: 'Color Mode', value: 'CMYK High-Fidelity' },
      { title: 'Turnaround Time', value: '2 - 3 Business Days' },
    ],
    templates: [],
    faqs: [
      { question: 'What paper weight is 130 GSM?', answer: '130 GSM is standard high-quality glossy leaflet paper, lightweight yet premium.' },
    ],
    relatedProducts: [],
    frequentlyBought: [],
    tags: ['flyers', 'leaflets', 'marketing', 'brochures', 'vistaprint'],
    metaTitle: 'Custom A5 Glossy Promotional Flyers | 4Prints',
    metaDescription: 'High impact custom printed A5 leaflets and marketing flyers.',
    keywords: ['flyer printing', 'promotional leaflets', 'marketing flyers', 'A5 flyers'],
    rating: { average: 4.7, totalReviews: 64 },
    status: { featured: false, bestSeller: true, newArrival: false, active: true },
  },
  {
    categorySlug: 'banners-posters-standees',
    subcategorySlug: 'rollup-display-standees',
    name: 'Retractable Roll-Up Banner Standee (6ft x 2.5ft)',
    slug: 'retractable-rollup-banner-standee',
    sku: 'VP-BANNER-ROLLUP-6X25',
    shortDescription: 'Star flex banner media with sturdy aluminum base and padded carry bag included.',
    description: 'Set up your exhibition, conference, or retail storefront booth in 30 seconds. Includes high-resolution matte/gloss non-curl banner film, retractable aluminum cassette base, support pole, and travel carrying bag.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
        alt: 'Roll-Up Standee Exhibition Display',
      },
      {
        url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80',
        alt: 'Banner Cassette Mechanism Close-up',
      },
    ],
    highlights: [
      '6ft Height x 2.5ft Width (180 cm x 75 cm)',
      'Non-Curl Matte Anti-Glare Banner Film',
      'Durable Silver Aluminum Pull-Up Mechanism',
      'Free Padded Shoulder Carry Bag Included',
    ],
    variants: [
      {
        name: 'Media Quality',
        type: 'radio',
        values: [
          { label: 'Standard Star Flex (Gloss)', value: 'star_flex' },
          { label: 'Premium Non-Curl Matte Film', value: 'non_curl' },
        ],
      },
    ],
    pricing: [
      { quantity: 1, price: 1299, discount: 0 },
      { quantity: 2, price: 2399, discount: 8 },
      { quantity: 5, price: 5499, discount: 15 },
      { quantity: 10, price: 9999, discount: 23 },
    ],
    minimumOrder: 1,
    allowDesignUpload: true,
    designInstructions: 'Design file should be 75cm x 180cm at 150+ DPI. Keep text 5cm away from the bottom cassette anchor.',
    specifications: [
      { title: 'Display Dimensions', value: '2.5 ft x 6 ft (75 cm x 180 cm)' },
      { title: 'Hardware Material', value: 'Anodized Aluminum Alloy' },
      { title: 'Weight', value: 'Approx 2.2 kg with bag' },
      { title: 'Setup Time', value: 'Under 1 Minute' },
    ],
    templates: [],
    faqs: [
      { question: 'Is the carry bag included?', answer: 'Yes, every standee comes with a black zippered nylon carry case.' },
    ],
    relatedProducts: [],
    frequentlyBought: [],
    tags: ['standee', 'roll-up banner', 'signage', 'trade show', 'vistaprint'],
    metaTitle: 'Retractable Roll-Up Banner Standees | 4Prints',
    metaDescription: 'Order custom roll-up standees with aluminum base and carry bag.',
    keywords: ['roll up standee', 'banner stand', 'pull up banner', 'trade show display'],
    rating: { average: 4.8, totalReviews: 53 },
    status: { featured: true, bestSeller: true, newArrival: true, active: true },
  },
];

async function seed() {
  const client = new MongoClient(uri);
  await client.connect();
  console.log('Connected to MongoDB Atlas successfully!');
  const db = client.db('four_print');

  const catCol = db.collection('categories');
  const subCol = db.collection('subcategories');
  const prodCol = db.collection('products');

  const now = new Date();

  // 1. Fix any existing broken images in categories (test5, test6, etc.)
  console.log('\n--- 1. Fixing existing broken category images in DB ---');
  await catCol.updateMany(
    { slug: 'test5' },
    { $set: { image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80', updatedAt: now } }
  );
  await catCol.updateMany(
    { slug: 'test6' },
    { $set: { image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80', updatedAt: now } }
  );
  await catCol.updateMany(
    { slug: 'test' },
    { $set: { image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80', updatedAt: now } }
  );
  await catCol.updateMany(
    { slug: 'test2' },
    { $set: { image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80', updatedAt: now } }
  );
  console.log('Fixed existing category image URLs with working CDN links.');

  // 2. Insert or update the 5 Vistaprint Categories
  console.log('\n--- 2. Seeding 5 Vistaprint Categories ---');
  const categoryMap = {}; // slug -> ObjectId string
  for (const cat of vistaprintCategories) {
    const existing = await catCol.findOne({ slug: cat.slug });
    let catId;
    if (existing) {
      catId = existing._id.toString();
      await catCol.updateOne(
        { _id: existing._id },
        {
          $set: {
            name: cat.name,
            description: cat.description,
            image: cat.image,
            isActive: cat.isActive,
            updatedAt: now,
          },
        }
      );
      console.log(`Updated Category: "${cat.name}" (ID: ${catId})`);
    } else {
      const doc = {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        isActive: cat.isActive,
        createdAt: now,
        updatedAt: now,
      };
      const res = await catCol.insertOne(doc);
      catId = res.insertedId.toString();
      console.log(`Inserted Category: "${cat.name}" (ID: ${catId})`);
    }
    categoryMap[cat.slug] = catId;
  }

  // 3. Insert or update the 5 Vistaprint Subcategories
  console.log('\n--- 3. Seeding 5 Vistaprint Subcategories ---');
  const subcategoryMap = {}; // slug -> ObjectId string
  for (const sub of vistaprintSubcategories) {
    const parentCatId = categoryMap[sub.categorySlug];
    if (!parentCatId) {
      console.warn(`Parent category not found for subcategory: ${sub.name}`);
      continue;
    }

    const existing = await subCol.findOne({ categoryId: parentCatId, slug: sub.slug });
    let subId;
    if (existing) {
      subId = existing._id.toString();
      await subCol.updateOne(
        { _id: existing._id },
        {
          $set: {
            name: sub.name,
            description: sub.description,
            image: sub.image,
            isActive: sub.isActive,
            updatedAt: now,
          },
        }
      );
      console.log(`Updated Subcategory: "${sub.name}" (ID: ${subId}) under Category: ${sub.categorySlug}`);
    } else {
      const doc = {
        categoryId: parentCatId,
        name: sub.name,
        slug: sub.slug,
        description: sub.description,
        image: sub.image,
        isActive: sub.isActive,
        createdAt: now,
        updatedAt: now,
      };
      const res = await subCol.insertOne(doc);
      subId = res.insertedId.toString();
      console.log(`Inserted Subcategory: "${sub.name}" (ID: ${subId}) under Category: ${sub.categorySlug}`);
    }
    subcategoryMap[sub.slug] = subId;
  }

  // 4. Insert or update the 5 Vistaprint Products
  console.log('\n--- 4. Seeding 5 Vistaprint Products ---');
  for (const prod of vistaprintProducts) {
    const catId = categoryMap[prod.categorySlug];
    const subId = subcategoryMap[prod.subcategorySlug];

    const prodDoc = {
      category: catId,
      subCategory: subId || null,
      name: prod.name,
      slug: prod.slug,
      sku: prod.sku,
      shortDescription: prod.shortDescription,
      description: prod.description,
      images: prod.images,
      highlights: prod.highlights,
      variants: prod.variants,
      pricing: prod.pricing,
      minimumOrder: prod.minimumOrder,
      allowDesignUpload: prod.allowDesignUpload,
      designInstructions: prod.designInstructions,
      specifications: prod.specifications,
      templates: prod.templates,
      faqs: prod.faqs,
      relatedProducts: prod.relatedProducts,
      frequentlyBought: prod.frequentlyBought,
      tags: prod.tags,
      metaTitle: prod.metaTitle,
      metaDescription: prod.metaDescription,
      keywords: prod.keywords,
      rating: prod.rating,
      status: prod.status,
      updatedAt: now,
    };

    const existing = await prodCol.findOne({ sku: prod.sku });
    if (existing) {
      await prodCol.updateOne({ _id: existing._id }, { $set: prodDoc });
      console.log(`Updated Product: "${prod.name}" (SKU: ${prod.sku}, ID: ${existing._id.toString()})`);
    } else {
      prodDoc.createdAt = now;
      const res = await prodCol.insertOne(prodDoc);
      console.log(`Inserted Product: "${prod.name}" (SKU: ${prod.sku}, ID: ${res.insertedId.toString()})`);
    }
  }

  console.log('\n=== SEEDING SUMMARY ===');
  const totalCats = await catCol.countDocuments();
  const totalSubs = await subCol.countDocuments();
  const totalProds = await prodCol.countDocuments();
  console.log(`Total Categories in MongoDB: ${totalCats}`);
  console.log(`Total Subcategories in MongoDB: ${totalSubs}`);
  console.log(`Total Products in MongoDB: ${totalProds}`);

  await client.close();
  console.log('\nDatabase connection closed. Seeding finished successfully!');
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});

