import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: "gyrigoyen91@gmail.com" } });
  if (!user) throw new Error("User not found");

  // Create a curator profile for testing
  const curator = await prisma.curatorProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      storeName: "Gonzalo's Curated Collection",
      bio: "Fashion curator with an eye for timeless pieces",
      slug: "gonzalo-curated",
    },
  });

  // Create some demo products
  const product1 = await prisma.product.upsert({
    where: { id: "demo-1" },
    update: {},
    create: {
      id: "demo-1",
      curatorId: curator.id,
      title: "Classic Denim Jacket",
      description: "A timeless denim jacket perfect for any season",
      price: 124.99,
      category: "Jackets",
      tags: "denim,classic,casual",
      sizes: "S,M,L,XL",
      colors: "Blue,Black",
      stockQuantity: 10,
      slug: "classic-denim-jacket",
    },
  });

  const product2 = await prisma.product.upsert({
    where: { id: "demo-2" },
    update: {},
    create: {
      id: "demo-2",
      curatorId: curator.id,
      title: "Vintage Leather Bag",
      description: "Handcrafted leather bag with vintage charm",
      price: 89.99,
      category: "Bags",
      tags: "leather,vintage,handbag",
      sizes: "One Size",
      colors: "Brown,Tan",
      stockQuantity: 5,
      slug: "vintage-leather-bag",
    },
  });

  // Create product images
  await prisma.productImage.upsert({
    where: { id: "demo-img-1" },
    update: {},
    create: {
      id: "demo-img-1",
      productId: product1.id,
      url: "/images/demo-denim.jpg",
      altText: "Classic Denim Jacket",
      order: 0,
    },
  });

  await prisma.productImage.upsert({
    where: { id: "demo-img-2" },
    update: {},
    create: {
      id: "demo-img-2",
      productId: product2.id,
      url: "/images/demo-leather.jpg",
      altText: "Vintage Leather Bag",
      order: 0,
    },
  });

  // Create demo orders
  const order1 = await prisma.order.create({
    data: {
      buyerId: user.id,
      curatorId: curator.id,
      status: "DELIVERED",
      totalAmount: 124.99,
      commission: 12.50,
      curatorAmount: 112.49,
      items: {
        create: [
          {
            productId: product1.id,
            quantity: 1,
            price: 124.99,
            size: "M",
            color: "Blue",
          },
        ],
      },
      shippingAddress: {
        create: {
          fullName: "Gonzalo Yrigoyen Cook",
          email: "gyrigoyen91@gmail.com",
          phone: "+1234567890",
          address: "123 Main Street",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "USA",
        },
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      buyerId: user.id,
      curatorId: curator.id,
      status: "SHIPPED",
      totalAmount: 89.99,
      commission: 9.00,
      curatorAmount: 80.99,
      items: {
        create: [
          {
            productId: product2.id,
            quantity: 1,
            price: 89.99,
            size: "One Size",
            color: "Brown",
          },
        ],
      },
      shippingAddress: {
        create: {
          fullName: "Gonzalo Yrigoyen Cook",
          email: "gyrigoyen91@gmail.com",
          phone: "+1234567890",
          address: "123 Main Street",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "USA",
        },
      },
    },
  });

  console.log("✅ Seeded orders:", order1.id, order2.id);
  console.log("✅ Created products:", product1.title, product2.title);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding orders:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
