const { sequelize } = require('../config/database');
const {
  User,
  Category,
  Brand,
  Product,
  ProductImage,
  ProductVariant,
  Cart,
  CartItem,
  Wishlist,
  WishlistItem,
  Address,
  Order,
  OrderItem,
  Payment,
  Review,
  Testimonial,
  Conversation,
  Message,
} = require('../models');
const { hashPassword } = require('../utils/hash');

const seedDatabase = async () => {
  try {
    console.log('[Seed] Starting database migration & seeding...');
    await sequelize.sync({ force: true });
    console.log('[Seed] Tables cleared and schema synchronized.');

    // 1. Seed Users
    const adminPassword = await hashPassword('Admin@12345');
    const customerPassword = await hashPassword('Customer@12345');

    const admin = await User.create({
      name: 'DevTech Super Admin',
      email: 'admin@devtech.com',
      phone: '+1 234 567 8900',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    });

    const supportUser = await User.create({
      name: 'Sarah Support',
      email: 'support@devtech.com',
      phone: '+1 234 567 8901',
      password: adminPassword,
      role: 'SUPPORT',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    });

    const customer1 = await User.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 555 123 4567',
      password: customerPassword,
      role: 'CUSTOMER',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    });

    const customer2 = await User.create({
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1 555 987 6543',
      password: customerPassword,
      role: 'CUSTOMER',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    });

    const customer3 = await User.create({
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      phone: '+1 555 456 7890',
      password: customerPassword,
      role: 'CUSTOMER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    });

    // Create Carts & Wishlists for users
    for (const u of [admin, supportUser, customer1, customer2, customer3]) {
      await Cart.create({ userId: u.id });
      await Wishlist.create({ userId: u.id });
    }

    // 2. Seed Categories
    const categoriesData = [
      { name: 'Men', slug: 'men', description: 'Contemporary menswear, shirts, denim and accessories', image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=600&q=80' },
      { name: 'Women', slug: 'women', description: 'Curated womenswear, dresses, tops and outerwear', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80' },
      { name: 'Footwear', slug: 'footwear', description: 'Sneakers, leather boots, loafers and athletic shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80' },
      { name: 'Bags', slug: 'bags', description: 'Leather backpacks, totes, duffels and crossbody bags', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80' },
      { name: 'Watches', slug: 'watches', description: 'Luxury timepieces, chronographs and smart watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80' },
      { name: 'Electronics', slug: 'electronics', description: 'Premium headphones, audio equipment and smart gadgets', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80' },
      { name: 'Home & Living', slug: 'home-living', description: 'Modern decor, artisan ceramics and luxury essentials', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80' },
      { name: 'Beauty', slug: 'beauty', description: 'Premium skincare, fragrances and grooming essentials', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80' },
      { name: 'Deals', slug: 'deals', description: 'Exclusive seasonal sales and limited time discounts', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80' },
    ];

    const categoryMap = {};
    for (const cat of categoriesData) {
      const created = await Category.create(cat);
      categoryMap[cat.slug] = created.id;
    }

    // 3. Seed Brands
    const brandsData = [
      { name: 'Nike', slug: 'nike', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=150&q=80' },
      { name: 'Adidas', slug: 'adidas', logo: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=150&q=80' },
      { name: 'Puma', slug: 'puma', logo: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=150&q=80' },
      { name: "Levi's", slug: 'levis', logo: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=150&q=80' },
      { name: 'U.S. Polo Assn', slug: 'us-polo', logo: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=150&q=80' },
      { name: 'Zara', slug: 'zara', logo: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=150&q=80' },
      { name: 'Fossil', slug: 'fossil', logo: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=150&q=80' },
      { name: 'Sony', slug: 'sony', logo: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=150&q=80' },
    ];

    const brandMap = {};
    for (const b of brandsData) {
      const created = await Brand.create(b);
      brandMap[b.slug] = created.id;
    }

    // 4. Seed 32 Products with Rich Variants and Images
    const productsData = [
      // Men Category (1)
      {
        name: 'Casual Cotton Slim-Fit Shirt',
        slug: 'casual-cotton-slim-fit-shirt',
        description: 'Engineered from 100% breathable organic cotton, this casual slim-fit shirt offers unmatched comfort for both formal and weekend outings. Features a spread collar, mother-of-pearl buttons, and tailored cuffs.',
        shortDescription: '100% Organic breathable cotton tailored shirt',
        price: 49.99,
        discountPrice: 39.99,
        sku: 'SHIRT-M-001',
        stock: 45,
        categoryId: categoryMap['men'],
        brandId: brandMap['us-polo'],
        rating: 4.8,
        reviewCount: 24,
        isFeatured: true,
        images: [
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Olive Green', colorHex: '#556B2F', size: 'S', stock: 10, sku: 'SHIRT-M-001-OLV-S' },
          { color: 'Olive Green', colorHex: '#556B2F', size: 'M', stock: 15, sku: 'SHIRT-M-001-OLV-M' },
          { color: 'Olive Green', colorHex: '#556B2F', size: 'L', stock: 12, sku: 'SHIRT-M-001-OLV-L' },
          { color: 'Olive Green', colorHex: '#556B2F', size: 'XL', stock: 8, sku: 'SHIRT-M-001-OLV-XL' },
          { color: 'Navy Blue', colorHex: '#000080', size: 'M', stock: 10, sku: 'SHIRT-M-001-NVY-M' },
          { color: 'Navy Blue', colorHex: '#000080', size: 'L', stock: 8, sku: 'SHIRT-M-001-NVY-L' },
          { color: 'White', colorHex: '#FFFFFF', size: 'M', stock: 15, sku: 'SHIRT-M-001-WHT-M' },
          { color: 'White', colorHex: '#FFFFFF', size: 'L', stock: 10, sku: 'SHIRT-M-001-WHT-L' },
        ],
      },
      {
        name: "Classic 511 Slim Jeans",
        slug: 'classic-511-slim-jeans',
        description: "The definitive modern slim cut. With room to move, the 511 Slim Fit Jeans are a classic since right now. These jeans sit below the waist with a slim leg from hip to ankle.",
        shortDescription: 'Signature stretch denim slim jeans',
        price: 79.99,
        discountPrice: 64.99,
        sku: 'JEANS-M-002',
        stock: 35,
        categoryId: categoryMap['men'],
        brandId: brandMap['levis'],
        rating: 4.9,
        reviewCount: 38,
        isFeatured: true,
        images: [
          'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Indigo Blue', colorHex: '#1E3F66', size: '30/32', stock: 8, sku: 'JEANS-M-002-IND-30' },
          { color: 'Indigo Blue', colorHex: '#1E3F66', size: '32/32', stock: 12, sku: 'JEANS-M-002-IND-32' },
          { color: 'Indigo Blue', colorHex: '#1E3F66', size: '34/32', stock: 10, sku: 'JEANS-M-002-IND-34' },
          { color: 'Washed Black', colorHex: '#222222', size: '32/32', stock: 5, sku: 'JEANS-M-002-BLK-32' },
        ],
      },
      {
        name: 'Vintage Oversized Graphic Tee',
        slug: 'vintage-oversized-graphic-tee',
        description: 'Crafted with heavyweight 240 GSM organic cotton with a relaxed drop-shoulder silhouette and vintage enzyme wash finish.',
        shortDescription: 'Heavyweight organic cotton oversized tee',
        price: 34.99,
        discountPrice: 28.00,
        sku: 'TEE-M-003',
        stock: 50,
        categoryId: categoryMap['men'],
        brandId: brandMap['zara'],
        rating: 4.6,
        reviewCount: 16,
        isFeatured: false,
        images: [
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Charcoal Grey', colorHex: '#36454F', size: 'M', stock: 20, sku: 'TEE-M-003-CHR-M' },
          { color: 'Charcoal Grey', colorHex: '#36454F', size: 'L', stock: 20, sku: 'TEE-M-003-CHR-L' },
          { color: 'Vintage Cream', colorHex: '#FFFDD0', size: 'M', stock: 10, sku: 'TEE-M-003-CRM-M' },
        ],
      },
      {
        name: 'Structured Wool Blend Blazer',
        slug: 'structured-wool-blend-blazer',
        description: 'Impeccably tailored from premium Italian wool blend fabric with notched lapels, dual side vents, and interior passport pocket.',
        shortDescription: 'Premium Italian wool tailored formal blazer',
        price: 189.99,
        discountPrice: 149.99,
        sku: 'BLAZER-M-004',
        stock: 18,
        categoryId: categoryMap['men'],
        brandId: brandMap['zara'],
        rating: 4.9,
        reviewCount: 12,
        isFeatured: true,
        images: [
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Navy', colorHex: '#000080', size: '38R', stock: 6, sku: 'BLAZER-M-004-NVY-38' },
          { color: 'Navy', colorHex: '#000080', size: '40R', stock: 8, sku: 'BLAZER-M-004-NVY-40' },
          { color: 'Grey Melange', colorHex: '#808080', size: '40R', stock: 4, sku: 'BLAZER-M-004-GRY-40' },
        ],
      },

      // Women Category (2)
      {
        name: 'Floral Silk Midi Dress',
        slug: 'floral-silk-midi-dress',
        description: 'Featuring hand-painted botanical prints on pure mulberry silk, this midi dress offers an elegant A-line drape, delicate flutter sleeves, and a flattering tie waist.',
        shortDescription: 'Pure mulberry silk hand-painted midi dress',
        price: 129.99,
        discountPrice: 99.99,
        sku: 'DRESS-W-001',
        stock: 28,
        categoryId: categoryMap['women'],
        brandId: brandMap['zara'],
        rating: 4.9,
        reviewCount: 31,
        isFeatured: true,
        images: [
          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Rose Floral', colorHex: '#FF007F', size: 'S', stock: 8, sku: 'DRESS-W-001-RS-S' },
          { color: 'Rose Floral', colorHex: '#FF007F', size: 'M', stock: 12, sku: 'DRESS-W-001-RS-M' },
          { color: 'Rose Floral', colorHex: '#FF007F', size: 'L', stock: 8, sku: 'DRESS-W-001-RS-L' },
        ],
      },
      {
        name: 'Ribbed Knit Cashmere Sweater',
        slug: 'ribbed-knit-cashmere-sweater',
        description: 'Spun from sustainably sourced Grade-A Mongolian cashmere with a ribbed crew neck and ultra-soft hand feel.',
        shortDescription: '100% Pure Grade-A Mongolian Cashmere knit',
        price: 149.00,
        discountPrice: 119.00,
        sku: 'SWEATER-W-002',
        stock: 22,
        categoryId: categoryMap['women'],
        brandId: brandMap['zara'],
        rating: 4.8,
        reviewCount: 19,
        isFeatured: false,
        images: [
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Oatmeal Beige', colorHex: '#E1D9D1', size: 'S', stock: 7, sku: 'SW-W-002-OAT-S' },
          { color: 'Oatmeal Beige', colorHex: '#E1D9D1', size: 'M', stock: 10, sku: 'SW-W-002-OAT-M' },
          { color: 'Dusty Blue', colorHex: '#8CBEDB', size: 'M', stock: 5, sku: 'SW-W-002-BLU-M' },
        ],
      },
      {
        name: 'High-Rise Wide Leg Trousers',
        slug: 'high-rise-wide-leg-trousers',
        description: 'Chic tailored trousers with front pleats, slant pockets, and a fluid silhouette designed for effortless desk-to-dinner sophistication.',
        shortDescription: 'Tailored front-pleat fluid wide leg trousers',
        price: 69.99,
        discountPrice: 54.99,
        sku: 'TROUSERS-W-003',
        stock: 40,
        categoryId: categoryMap['women'],
        brandId: brandMap['zara'],
        rating: 4.7,
        reviewCount: 22,
        isFeatured: true,
        images: [
          'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Camel Brown', colorHex: '#C19A6B', size: 'XS', stock: 8, sku: 'TR-W-003-CML-XS' },
          { color: 'Camel Brown', colorHex: '#C19A6B', size: 'S', stock: 14, sku: 'TR-W-003-CML-S' },
          { color: 'Camel Brown', colorHex: '#C19A6B', size: 'M', stock: 12, sku: 'TR-W-003-CML-M' },
          { color: 'Midnight Black', colorHex: '#111111', size: 'S', stock: 6, sku: 'TR-W-003-BLK-S' },
        ],
      },

      // Footwear Category (3)
      {
        name: 'Air Max Pulse Running Shoes',
        slug: 'air-max-pulse-running-shoes',
        description: 'Drawing inspiration from the London music scene, the Air Max Pulse brings a tough-yet-sleek aesthetic to the iconic Air Max line. Point-loaded Air cushioning provides unmatched responsiveness.',
        shortDescription: 'Engineered responsive Air cushioning sneakers',
        price: 159.99,
        discountPrice: 129.99,
        sku: 'SHOE-NK-001',
        stock: 30,
        categoryId: categoryMap['footwear'],
        brandId: brandMap['nike'],
        rating: 4.9,
        reviewCount: 52,
        isFeatured: true,
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Crimson Red', colorHex: '#DC143C', size: 'US 8', stock: 5, sku: 'SHOE-NK-001-RED-8' },
          { color: 'Crimson Red', colorHex: '#DC143C', size: 'US 9', stock: 10, sku: 'SHOE-NK-001-RED-9' },
          { color: 'Crimson Red', colorHex: '#DC143C', size: 'US 10', stock: 10, sku: 'SHOE-NK-001-RED-10' },
          { color: 'Crimson Red', colorHex: '#DC143C', size: 'US 11', stock: 5, sku: 'SHOE-NK-001-RED-11' },
        ],
      },
      {
        name: 'Ultraboost Light Performance Runners',
        slug: 'ultraboost-light-performance-runners',
        description: 'Experience epic energy with the lightest Ultraboost yet. The Linear Energy Push system on the sole increases stability for smooth, snappy strides.',
        shortDescription: 'Ultra-light responsive running shoes',
        price: 189.99,
        discountPrice: 159.99,
        sku: 'SHOE-AD-002',
        stock: 24,
        categoryId: categoryMap['footwear'],
        brandId: brandMap['adidas'],
        rating: 4.8,
        reviewCount: 41,
        isFeatured: true,
        images: [
          'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Core Black', colorHex: '#000000', size: 'US 9', stock: 8, sku: 'SHOE-AD-002-BLK-9' },
          { color: 'Core Black', colorHex: '#000000', size: 'US 10', stock: 10, sku: 'SHOE-AD-002-BLK-10' },
          { color: 'Cloud White', colorHex: '#FFFFFF', size: 'US 9', stock: 6, sku: 'SHOE-AD-002-WHT-9' },
        ],
      },
      {
        name: 'Handcrafted Italian Leather Chelsea Boots',
        slug: 'handcrafted-italian-leather-chelsea-boots',
        description: 'Made from full-grain Tuscan calfskin leather with Goodyear welt construction, memory foam insoles, and durable rubber lug soles.',
        shortDescription: 'Full-grain Tuscan calfskin Goodyear welt boots',
        price: 249.99,
        discountPrice: 199.99,
        sku: 'SHOE-CH-003',
        stock: 15,
        categoryId: categoryMap['footwear'],
        brandId: brandMap['zara'],
        rating: 4.9,
        reviewCount: 29,
        isFeatured: false,
        images: [
          'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Espresso Brown', colorHex: '#4B3621', size: 'EU 41', stock: 4, sku: 'CHELSEA-BRN-41' },
          { color: 'Espresso Brown', colorHex: '#4B3621', size: 'EU 42', stock: 6, sku: 'CHELSEA-BRN-42' },
          { color: 'Espresso Brown', colorHex: '#4B3621', size: 'EU 43', stock: 5, sku: 'CHELSEA-BRN-43' },
        ],
      },

      // Bags Category (4)
      {
        name: 'Voyager Full-Grain Leather Backpack',
        slug: 'voyager-full-grain-leather-backpack',
        description: 'Handcrafted from oil-waxed full-grain leather, the Voyager fits up to a 16-inch laptop with padded compartment, waterproof lining, and antique brass hardware.',
        shortDescription: 'Oil-waxed full grain leather 16-inch laptop backpack',
        price: 199.99,
        discountPrice: 169.99,
        sku: 'BAG-L-001',
        stock: 20,
        categoryId: categoryMap['bags'],
        brandId: brandMap['fossil'],
        rating: 4.9,
        reviewCount: 34,
        isFeatured: true,
        images: [
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Cognac Brown', colorHex: '#9E4714', size: 'One Size', stock: 12, sku: 'BAG-L-001-CGN' },
          { color: 'Obsidian Black', colorHex: '#0B0B0B', size: 'One Size', stock: 8, sku: 'BAG-L-001-BLK' },
        ],
      },
      {
        name: 'Structured Leather Crossbody Bag',
        slug: 'structured-leather-crossbody-bag',
        description: 'A minimalist silhouette crafted with scratch-resistant saffiano leather, magnetic foldover flap, and detachable polished gold chain strap.',
        shortDescription: 'Scratch-resistant Saffiano leather crossbody',
        price: 119.99,
        discountPrice: 89.99,
        sku: 'BAG-W-002',
        stock: 25,
        categoryId: categoryMap['bags'],
        brandId: brandMap['zara'],
        rating: 4.8,
        reviewCount: 19,
        isFeatured: false,
        images: [
          'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Blush Nude', colorHex: '#E8C5B8', size: 'One Size', stock: 15, sku: 'BAG-W-002-NUD' },
          { color: 'Jet Black', colorHex: '#000000', size: 'One Size', stock: 10, sku: 'BAG-W-002-BLK' },
        ],
      },
      {
        name: 'Weekend Canvas & Leather Duffel',
        slug: 'weekend-canvas-leather-duffel',
        description: 'The ultimate 45L getaway bag built with water-resistant 18oz waxed canvas, reinforced leather base, and separate ventilated shoe compartment.',
        shortDescription: '45L Water-resistant waxed canvas travel duffel',
        price: 139.99,
        discountPrice: 109.99,
        sku: 'BAG-D-003',
        stock: 30,
        categoryId: categoryMap['bags'],
        brandId: brandMap['fossil'],
        rating: 4.9,
        reviewCount: 27,
        isFeatured: true,
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Army Green', colorHex: '#4B5320', size: '45L', stock: 18, sku: 'BAG-D-003-GRN' },
          { color: 'Charcoal Grey', colorHex: '#36454F', size: '45L', stock: 12, sku: 'BAG-D-003-GRY' },
        ],
      },

      // Watches Category (5)
      {
        name: 'Minimalist Automatic Chronograph Watch',
        slug: 'minimalist-automatic-chronograph-watch',
        description: 'Featuring a Japanese 21-jewel automatic movement, sapphire crystal scratch-resistant glass, date aperture, and interchangeable Horween leather strap.',
        shortDescription: 'Japanese 21-jewel automatic sapphire timepiece',
        price: 299.99,
        discountPrice: 249.99,
        sku: 'WATCH-001',
        stock: 14,
        categoryId: categoryMap['watches'],
        brandId: brandMap['fossil'],
        rating: 5.0,
        reviewCount: 45,
        isFeatured: true,
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Rose Gold / Tan', colorHex: '#B76E79', size: '40mm', stock: 8, sku: 'WATCH-001-RG-40' },
          { color: 'Silver / Black', colorHex: '#C0C0C0', size: '40mm', stock: 6, sku: 'WATCH-001-SLV-40' },
        ],
      },
      {
        name: 'Heritage Stainless Steel Diver Watch',
        slug: 'heritage-stainless-steel-diver-watch',
        description: 'Rated for 200m water resistance with unidirectional ceramic bezel, luminous Super-LumiNova markers, and solid link 316L stainless steel bracelet.',
        shortDescription: '200M Water-resistant 316L stainless steel diver',
        price: 349.00,
        discountPrice: 289.00,
        sku: 'WATCH-002',
        stock: 10,
        categoryId: categoryMap['watches'],
        brandId: brandMap['fossil'],
        rating: 4.9,
        reviewCount: 30,
        isFeatured: true,
        images: [
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Deep Ocean Blue', colorHex: '#002244', size: '42mm', stock: 5, sku: 'WATCH-002-BLU-42' },
          { color: 'Emerald Green', colorHex: '#50C878', size: '42mm', stock: 5, sku: 'WATCH-002-GRN-42' },
        ],
      },

      // Electronics Category (6)
      {
        name: 'AcousticPro Wireless Noise-Cancelling Headphones',
        slug: 'acousticpro-wireless-noise-cancelling-headphones',
        description: 'Equipped with custom 40mm titanium drivers, industry-leading active noise cancellation, 45-hour battery life, and high-resolution LDAC Bluetooth audio streaming.',
        shortDescription: 'Active noise cancellation with 45h battery life',
        price: 279.99,
        discountPrice: 219.99,
        sku: 'ELEC-HP-001',
        stock: 25,
        categoryId: categoryMap['electronics'],
        brandId: brandMap['sony'],
        rating: 4.9,
        reviewCount: 68,
        isFeatured: true,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Matte Black', colorHex: '#1C1C1C', size: 'Standard', stock: 15, sku: 'ELEC-HP-001-BLK' },
          { color: 'Silver Sand', colorHex: '#C2B280', size: 'Standard', stock: 10, sku: 'ELEC-HP-001-SND' },
        ],
      },
      {
        name: 'Studio Soundbar with Dolby Atmos & Wireless Sub',
        slug: 'studio-soundbar-dolby-atmos',
        description: 'Transform your entertainment space with 3D spatial audio, 380W total output, HDMI eARC, and seamless Spotify Connect and AirPlay 2 streaming.',
        shortDescription: '380W Spatial 3D Audio with wireless subwoofer',
        price: 399.99,
        discountPrice: 329.99,
        sku: 'ELEC-SB-002',
        stock: 12,
        categoryId: categoryMap['electronics'],
        brandId: brandMap['sony'],
        rating: 4.8,
        reviewCount: 23,
        isFeatured: false,
        images: [
          'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Midnight Black', colorHex: '#000000', size: '3.1 Channel', stock: 12, sku: 'ELEC-SB-002-31' },
        ],
      },

      // Home & Living Category (7)
      {
        name: 'Artisan Ceramic Table Lamp & Linen Shade',
        slug: 'artisan-ceramic-table-lamp',
        description: 'Hand-thrown stoneware lamp base finished in warm matte terracotta glaze, paired with a natural French flax linen drum lampshade.',
        shortDescription: 'Hand-thrown stoneware ceramic table lamp',
        price: 89.99,
        discountPrice: 74.99,
        sku: 'HOME-L-001',
        stock: 30,
        categoryId: categoryMap['home-living'],
        brandId: brandMap['zara'],
        rating: 4.7,
        reviewCount: 18,
        isFeatured: false,
        images: [
          'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Terracotta', colorHex: '#E2725B', size: 'Medium', stock: 18, sku: 'LAMP-TER-M' },
          { color: 'Cream Stone', colorHex: '#FDFBF7', size: 'Medium', stock: 12, sku: 'LAMP-CRM-M' },
        ],
      },
      {
        name: 'Handwoven Moroccan Wool Area Rug',
        slug: 'handwoven-moroccan-wool-area-rug',
        description: 'Woven by artisan cooperatives in the Atlas Mountains with 100% un-dyed virgin wool, featuring geometric Berber tribal symbols and plush 30mm pile.',
        shortDescription: '100% Virgin wool plush Moroccan tribal rug',
        price: 349.99,
        discountPrice: 289.99,
        sku: 'HOME-RUG-002',
        stock: 8,
        categoryId: categoryMap['home-living'],
        brandId: brandMap['zara'],
        rating: 4.9,
        reviewCount: 15,
        isFeatured: true,
        images: [
          'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Natural Ivory', colorHex: '#FFFFF0', size: '5x8 ft', stock: 5, sku: 'RUG-5X8' },
          { color: 'Natural Ivory', colorHex: '#FFFFF0', size: '8x10 ft', stock: 3, sku: 'RUG-8X10', additionalPrice: 150 },
        ],
      },

      // Beauty Category (8)
      {
        name: 'Botanical Hydrating Serum & Glow Elixir',
        slug: 'botanical-hydrating-serum',
        description: 'Formulated with multi-molecular hyaluronic acid, niacinamide, and cold-pressed squalane to deeply hydrate, plump, and restore your skin barrier.',
        shortDescription: 'Multi-molecular hyaluronic acid & squalane glow serum',
        price: 48.00,
        discountPrice: 38.00,
        sku: 'BEAUTY-S-001',
        stock: 55,
        categoryId: categoryMap['beauty'],
        brandId: brandMap['zara'],
        rating: 4.9,
        reviewCount: 42,
        isFeatured: true,
        images: [
          'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1608248597359-00998f49d21c?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Clear', colorHex: '#E0F7FA', size: '30ml', stock: 35, sku: 'BEAUTY-S-30ML' },
          { color: 'Clear', colorHex: '#E0F7FA', size: '50ml', stock: 20, sku: 'BEAUTY-S-50ML', additionalPrice: 20 },
        ],
      },
      {
        name: 'Artisan Eau de Parfum - Sandalwood & Fig',
        slug: 'artisan-eau-de-parfum-sandalwood-fig',
        description: 'A sophisticated fragrance opening with crisp Mediterranean green fig, blossoming into velvety cedarwood, amber resin, and creamy Mysore sandalwood.',
        shortDescription: 'Long-lasting niche extrait with Mysore sandalwood & fig',
        price: 95.00,
        discountPrice: 79.00,
        sku: 'PERFUME-002',
        stock: 32,
        categoryId: categoryMap['beauty'],
        brandId: brandMap['zara'],
        rating: 4.8,
        reviewCount: 26,
        isFeatured: false,
        images: [
          'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Amber Mist', colorHex: '#FFBF00', size: '50ml', stock: 20, sku: 'PERFUME-50ML' },
          { color: 'Amber Mist', colorHex: '#FFBF00', size: '100ml', stock: 12, sku: 'PERFUME-100ML', additionalPrice: 40 },
        ],
      },

      // Deals Category (9)
      {
        name: 'Polarized Aviator Sunglasses (50% OFF Flash Deal)',
        slug: 'polarized-aviator-sunglasses-deal',
        description: 'Features ultralight titanium frame, scratch-resistant polarized polycarbonate lenses with 100% UV400 protection, and anti-glare coating.',
        shortDescription: 'Ultralight titanium frame polarized UV400 aviators',
        price: 99.99,
        discountPrice: 49.99,
        sku: 'DEAL-SUN-001',
        stock: 60,
        categoryId: categoryMap['deals'],
        brandId: brandMap['fossil'],
        rating: 4.8,
        reviewCount: 37,
        isFeatured: true,
        images: [
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Gold / Green Lens', colorHex: '#FFD700', size: 'Standard', stock: 35, sku: 'SUN-GLD-GRN' },
          { color: 'Gunmetal / Grey Lens', colorHex: '#2A3439', size: 'Standard', stock: 25, sku: 'SUN-GNM-GRY' },
        ],
      },
      {
        name: 'Everyday Stainless Steel Insulated Tumbler',
        slug: 'everyday-insulated-tumbler-deal',
        description: 'Double-wall vacuum insulation keeps iced coffee chilled for 24 hours and tea piping hot for 12 hours. Features a leakproof flip straw lid.',
        shortDescription: 'Vacuum insulated 32oz tumbler with flip straw lid',
        price: 38.00,
        discountPrice: 22.00,
        sku: 'DEAL-TUMB-002',
        stock: 75,
        categoryId: categoryMap['deals'],
        brandId: brandMap['nike'],
        rating: 4.9,
        reviewCount: 49,
        isFeatured: true,
        images: [
          'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Matte Sage', colorHex: '#9CAF88', size: '32oz', stock: 40, sku: 'TUMB-SGE-32' },
          { color: 'Blush Pink', colorHex: '#FFC0CB', size: '32oz', stock: 35, sku: 'TUMB-PNK-32' },
        ],
      },
      {
        name: 'Smart Hybrid Fitness Tracker Watch',
        slug: 'smart-hybrid-fitness-tracker-watch',
        description: 'Blends analog aesthetics with continuous heart-rate tracking, SpO2 monitoring, sleep scoring, and 2-week battery endurance on a single charge.',
        shortDescription: 'Analog aesthetics with comprehensive biometric sensors',
        price: 179.99,
        discountPrice: 149.99,
        sku: 'WATCH-SMT-003',
        stock: 22,
        categoryId: categoryMap['watches'],
        brandId: brandMap['fossil'],
        rating: 4.7,
        reviewCount: 28,
        isFeatured: true,
        images: [
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Smoke Grey', colorHex: '#708090', size: '42mm', stock: 12, sku: 'WATCH-SMT-003-SMK' },
          { color: 'Rose Gold', colorHex: '#B76E79', size: '38mm', stock: 10, sku: 'WATCH-SMT-003-RG' },
        ],
      },
      {
        name: 'Retro Suede Casual Court Sneakers',
        slug: 'retro-suede-casual-court-sneakers',
        description: 'Vintage 70s court silhouette crafted with velvety Italian split suede, padded tongue, gum rubber outsoles, and cushioned OrthoLite insoles.',
        shortDescription: 'Italian split suede court silhouette with gum outsole',
        price: 110.00,
        discountPrice: 88.00,
        sku: 'SHOE-PM-004',
        stock: 35,
        categoryId: categoryMap['footwear'],
        brandId: brandMap['puma'],
        rating: 4.8,
        reviewCount: 34,
        isFeatured: false,
        images: [
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Forest Green', colorHex: '#228B22', size: 'US 9', stock: 15, sku: 'SHOE-PM-004-GRN-9' },
          { color: 'Forest Green', colorHex: '#228B22', size: 'US 10', stock: 20, sku: 'SHOE-PM-004-GRN-10' },
        ],
      },
      {
        name: 'Pure Linen Relaxed Resort Shirt',
        slug: 'pure-linen-relaxed-resort-shirt',
        description: 'Woven from airy 100% French flax linen, pre-washed for extra softness. Features a camp collar, mother-of-pearl buttons, and straight hem.',
        shortDescription: '100% French flax linen camp collar shirt',
        price: 64.99,
        discountPrice: 49.99,
        sku: 'SHIRT-M-005',
        stock: 40,
        categoryId: categoryMap['men'],
        brandId: brandMap['us-polo'],
        rating: 4.9,
        reviewCount: 22,
        isFeatured: true,
        images: [
          'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Sky Blue', colorHex: '#87CEEB', size: 'M', stock: 18, sku: 'SHIRT-LIN-BLU-M' },
          { color: 'Sand Beige', colorHex: '#C2B280', size: 'L', stock: 22, sku: 'SHIRT-LIN-SND-L' },
        ],
      },
      {
        name: 'Pleated Satin Slip Skirt',
        slug: 'pleated-satin-slip-skirt',
        description: 'Bias-cut from lustrous heavyweight silk satin with an elasticized waistband and fluid drape that moves gracefully with every step.',
        shortDescription: 'Bias-cut lustrous heavyweight satin skirt',
        price: 74.99,
        discountPrice: 59.99,
        sku: 'SKIRT-W-004',
        stock: 30,
        categoryId: categoryMap['women'],
        brandId: brandMap['zara'],
        rating: 4.7,
        reviewCount: 19,
        isFeatured: false,
        images: [
          'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Champagne Gold', colorHex: '#F7E7CE', size: 'S', stock: 15, sku: 'SKIRT-GLD-S' },
          { color: 'Emerald Green', colorHex: '#50C878', size: 'M', stock: 15, sku: 'SKIRT-EMR-M' },
        ],
      },
      {
        name: 'Slim Cardholder in Saffiano Calfskin',
        slug: 'slim-cardholder-saffiano-calfskin',
        description: 'Featuring 6 card slots, central cash sleeve, and RFID-blocking protective lining wrapped in durable Italian Saffiano calfskin.',
        shortDescription: '6-slot RFID blocking Saffiano calfskin cardholder',
        price: 39.99,
        discountPrice: 29.99,
        sku: 'BAG-WLT-004',
        stock: 50,
        categoryId: categoryMap['bags'],
        brandId: brandMap['fossil'],
        rating: 4.9,
        reviewCount: 40,
        isFeatured: false,
        images: [
          'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Black Onyx', colorHex: '#0F0F0F', size: 'Slim', stock: 30, sku: 'WLT-BLK' },
          { color: 'British Tan', colorHex: '#A0522D', size: 'Slim', stock: 20, sku: 'WLT-TAN' },
        ],
      },
      {
        name: 'True Wireless Studio Earbuds ANC',
        slug: 'true-wireless-studio-earbuds-anc',
        description: 'Features hybrid noise cancelling, IPX5 sweat resistance, custom equalizer via companion app, and wireless Qi charging case.',
        shortDescription: 'Hybrid ANC earbuds with Qi wireless charging',
        price: 149.99,
        discountPrice: 119.99,
        sku: 'ELEC-EB-003',
        stock: 45,
        categoryId: categoryMap['electronics'],
        brandId: brandMap['sony'],
        rating: 4.8,
        reviewCount: 56,
        isFeatured: true,
        images: [
          'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Glacier White', colorHex: '#F5F5F5', size: 'Standard', stock: 25, sku: 'EB-WHT' },
          { color: 'Midnight Navy', colorHex: '#000080', size: 'Standard', stock: 20, sku: 'EB-NVY' },
        ],
      },
      {
        name: 'Aroma Diffuser with Ambient LED Glow',
        slug: 'aroma-diffuser-ambient-led-glow',
        description: 'Ultrasonic whisper-quiet mist technology paired with solid beech wood base, ceramic housing, and soothing warm ambient lighting modes.',
        shortDescription: 'Ultrasonic ceramic & beechwood essential oil diffuser',
        price: 59.99,
        discountPrice: 45.00,
        sku: 'HOME-DIF-003',
        stock: 35,
        categoryId: categoryMap['home-living'],
        brandId: brandMap['zara'],
        rating: 4.9,
        reviewCount: 33,
        isFeatured: false,
        images: [
          'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Natural Wood & White', colorHex: '#DEB887', size: '300ml', stock: 35, sku: 'DIF-300ML' },
        ],
      },
      {
        name: 'Nourishing Peptide Lip & Eye Butter',
        slug: 'nourishing-peptide-lip-eye-butter',
        description: 'Infused with tri-peptides, marula oil, and cupuaçu butter to smooth micro-lines and deliver deep 12-hour hydration.',
        shortDescription: 'Tri-peptide restorative lip and under-eye treatment',
        price: 26.00,
        discountPrice: 19.99,
        sku: 'BEAUTY-LIP-003',
        stock: 80,
        categoryId: categoryMap['beauty'],
        brandId: brandMap['zara'],
        rating: 4.9,
        reviewCount: 51,
        isFeatured: false,
        images: [
          'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Vanilla Glaze', colorHex: '#FDF5E6', size: '15ml', stock: 80, sku: 'LIP-15ML' },
        ],
      },
      {
        name: 'Fast-Charging Magnetic Power Bank 10000mAh',
        slug: 'fast-charging-magnetic-power-bank-deal',
        description: '20W PD fast charging with strong MagSafe magnetic alignment, LED battery level readout, and aircraft-grade aluminum casing.',
        shortDescription: '20W PD Magnetic 10000mAh portable wireless power bank',
        price: 54.99,
        discountPrice: 32.99,
        sku: 'DEAL-PWR-003',
        stock: 65,
        categoryId: categoryMap['deals'],
        brandId: brandMap['sony'],
        rating: 4.8,
        reviewCount: 62,
        isFeatured: true,
        images: [
          'https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        ],
        variants: [
          { color: 'Space Grey', colorHex: '#4A4A4A', size: '10000mAh', stock: 35, sku: 'PWR-GRY-10K' },
          { color: 'Silver', colorHex: '#D3D3D3', size: '10000mAh', stock: 30, sku: 'PWR-SLV-10K' },
        ],
      },
    ];

    const createdProducts = [];
    for (const pData of productsData) {
      const { images, variants, ...prodFields } = pData;
      const product = await Product.create({
        ...prodFields,
        status: true,
      });

      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await ProductImage.create({
            productId: product.id,
            imageUrl: images[i],
            altText: product.name,
            isPrimary: i === 0,
            sortOrder: i,
          });
        }
      }

      if (variants && variants.length > 0) {
        for (const v of variants) {
          await ProductVariant.create({
            productId: product.id,
            color: v.color,
            colorHex: v.colorHex,
            size: v.size,
            sku: v.sku,
            stock: v.stock,
            additionalPrice: v.additionalPrice || 0,
          });
        }
      }

      createdProducts.push(product);
    }
    console.log(`[Seed] Created ${createdProducts.length} comprehensive products with images and variants.`);

    // 5. Seed Customer Addresses
    const addr1 = await Address.create({
      userId: customer1.id,
      fullName: 'John Doe',
      phone: '+1 555 123 4567',
      addressLine1: '742 Evergreen Terrace',
      addressLine2: 'Apt 4B',
      city: 'Springfield',
      state: 'Oregon',
      postalCode: '97477',
      country: 'United States',
      isDefault: true,
    });

    const addr2 = await Address.create({
      userId: customer2.id,
      fullName: 'Jane Smith',
      phone: '+1 555 987 6543',
      addressLine1: '123 Market Street',
      addressLine2: 'Suite 200',
      city: 'San Francisco',
      state: 'California',
      postalCode: '94105',
      country: 'United States',
      isDefault: true,
    });

    // 6. Seed Sample Cart and Wishlist Items for John Doe
    const johnCart = await Cart.findOne({ where: { userId: customer1.id } });
    if (johnCart && createdProducts.length > 0) {
      const v1 = await ProductVariant.findOne({ where: { productId: createdProducts[0].id } });
      await CartItem.create({
        cartId: johnCart.id,
        productId: createdProducts[0].id,
        variantId: v1 ? v1.id : null,
        quantity: 2,
      });

      const v2 = await ProductVariant.findOne({ where: { productId: createdProducts[7].id } });
      await CartItem.create({
        cartId: johnCart.id,
        productId: createdProducts[7].id,
        variantId: v2 ? v2.id : null,
        quantity: 1,
      });
    }

    const johnWishlist = await Wishlist.findOne({ where: { userId: customer1.id } });
    if (johnWishlist && createdProducts.length > 2) {
      await WishlistItem.create({
        wishlistId: johnWishlist.id,
        productId: createdProducts[1].id,
      });
      await WishlistItem.create({
        wishlistId: johnWishlist.id,
        productId: createdProducts[4].id,
      });
    }

    // 7. Seed Sample Historical Orders
    const order1 = await Order.create({
      orderNumber: `ORD-${Date.now() - 10000000}-8391`,
      userId: customer1.id,
      addressId: addr1.id,
      shippingAddressSnapshot: JSON.stringify(addr1),
      subtotal: 199.99,
      shippingFee: 0.00,
      tax: 10.00,
      discount: 0.00,
      totalAmount: 209.99,
      status: 'Delivered',
      paymentStatus: 'Paid',
      paymentMethod: 'COD',
      createdAt: new Date(Date.now() - 86400000 * 5),
    });

    await OrderItem.create({
      orderId: order1.id,
      productId: createdProducts[10].id,
      productName: createdProducts[10].name,
      productImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
      variantInfo: 'Color: Cognac Brown',
      quantity: 1,
      unitPrice: 199.99,
      totalPrice: 199.99,
    });

    await Payment.create({
      orderId: order1.id,
      userId: customer1.id,
      provider: 'COD',
      providerPaymentId: 'pay_live_sample_01',
      amount: 209.99,
      currency: 'INR',
      status: 'Captured',
    });

    const order2 = await Order.create({
      orderNumber: `ORD-${Date.now() - 5000000}-1248`,
      userId: customer2.id,
      addressId: addr2.id,
      shippingAddressSnapshot: JSON.stringify(addr2),
      subtotal: 129.99,
      shippingFee: 0.00,
      tax: 6.50,
      discount: 0.00,
      totalAmount: 136.49,
      status: 'Shipped',
      paymentStatus: 'Paid',
      paymentMethod: 'COD',
      createdAt: new Date(Date.now() - 86400000 * 2),
    });

    await OrderItem.create({
      orderId: order2.id,
      productId: createdProducts[4].id,
      productName: createdProducts[4].name,
      productImage: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
      variantInfo: 'Color: Rose Floral Size: M',
      quantity: 1,
      unitPrice: 129.99,
      totalPrice: 129.99,
    });

    await Payment.create({
      orderId: order2.id,
      userId: customer2.id,
      provider: 'COD',
      providerPaymentId: 'pay_live_sample_02',
      amount: 136.49,
      currency: 'INR',
      status: 'Captured',
    });

    // 8. Seed Customer Reviews
    await Review.create({
      userId: customer1.id,
      productId: createdProducts[0].id,
      rating: 5,
      comment: 'Absolutely love the quality of this shirt. The cotton feels substantial yet airy in summer. Fits true to size!',
      isApproved: true,
    });

    await Review.create({
      userId: customer2.id,
      productId: createdProducts[0].id,
      rating: 5,
      comment: 'Bought this for my husband and it looks incredible. The olive green shade is even richer in person.',
      isApproved: true,
    });

    await Review.create({
      userId: customer3.id,
      productId: createdProducts[7].id,
      rating: 5,
      comment: 'Best running shoes I have owned this year. Incredible energy return on 10k morning jogs.',
      isApproved: true,
    });

    // 9. Seed Testimonials
    const testimonialsData = [
      {
        name: 'Emily Watson',
        role: 'Verified Customer • London',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        comment: 'DevTech transformed how I shop online. The product quality exceeded my highest expectations and delivery took only two days!',
        isFeatured: true,
      },
      {
        name: 'Marcus Chen',
        role: 'Verified Buyer • New York',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        comment: 'The attention to detail in the packaging and craftsmanship of the leather goods is unmatched. Customer support was incredibly swift.',
        isFeatured: true,
      },
      {
        name: 'Sophia Laurent',
        role: 'Fashion Stylist • Paris',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        comment: 'I recommend DevTech curated collections to all my private styling clients. Clean silhouettes, enduring materials, and effortless checkout.',
        isFeatured: true,
      },
    ];

    for (const t of testimonialsData) {
      await Testimonial.create(t);
    }

    // 10. Seed Conversation & Messages
    const conv = await Conversation.create({
      userId: customer1.id,
      userName: customer1.name,
      status: 'OPEN',
      lastMessage: 'Thank you, that clarifies my question about sizing!',
      lastMessageAt: new Date(),
    });

    await Message.create({
      conversationId: conv.id,
      senderId: customer1.id,
      senderType: 'CUSTOMER',
      senderName: customer1.name,
      message: 'Hi, does the casual cotton shirt fit slim or regular?',
      isRead: true,
    });

    await Message.create({
      conversationId: conv.id,
      senderId: admin.id,
      senderType: 'ADMIN',
      senderName: 'DevTech Support',
      message: 'Hello John! It is a tailored modern slim-fit cut. If you prefer a looser drape, we recommend ordering one size up.',
      isRead: true,
    });

    console.log('[Seed] Database seeding completed successfully!');
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase().then(() => {
    console.log('[Seed] Finished. Exiting.');
    process.exit(0);
  });
}

module.exports = seedDatabase;
