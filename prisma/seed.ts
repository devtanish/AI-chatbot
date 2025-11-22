import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // Create Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        subscriptionType: 'premium',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Bob Smith',
        email: 'bob@example.com',
        subscriptionType: 'basic',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Carol White',
        email: 'carol@example.com',
        subscriptionType: null,
      },
    }),
    prisma.user.create({
      data: {
        name: 'David Brown',
        email: 'david@example.com',
        subscriptionType: 'premium',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Eva Martinez',
        email: 'eva@example.com',
        subscriptionType: 'basic',
      },
    }),
  ]);

  // Create Products
  const products = await Promise.all([
    prisma.product.create({
      data: { name: 'Wireless Headphones', price: 79.99, category: 'Electronics', stockCount: 150 },
    }),
    prisma.product.create({
      data: { name: 'Running Shoes', price: 129.99, category: 'Sports', stockCount: 75 },
    }),
    prisma.product.create({
      data: { name: 'Coffee Maker', price: 49.99, category: 'Home', stockCount: 200 },
    }),
    prisma.product.create({
      data: { name: 'Yoga Mat', price: 29.99, category: 'Sports', stockCount: 300 },
    }),
    prisma.product.create({
      data: { name: 'Laptop Stand', price: 39.99, category: 'Electronics', stockCount: 120 },
    }),
    prisma.product.create({
      data: { name: 'Water Bottle', price: 19.99, category: 'Sports', stockCount: 500 },
    }),
    prisma.product.create({
      data: { name: 'Desk Lamp', price: 34.99, category: 'Home', stockCount: 180 },
    }),
    prisma.product.create({
      data: { name: 'Bluetooth Speaker', price: 59.99, category: 'Electronics', stockCount: 90 },
    }),
  ]);

  // Create Orders with Transactions
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        userId: users[0].id,
        totalAmount: 159.98,
        status: 'completed',
        transactions: {
          create: [
            { paymentMethod: 'credit_card', amount: 159.98, status: 'success' },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        userId: users[0].id,
        totalAmount: 49.99,
        status: 'completed',
        transactions: {
          create: [
            { paymentMethod: 'paypal', amount: 49.99, status: 'success' },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        userId: users[1].id,
        totalAmount: 129.99,
        status: 'pending',
        transactions: {
          create: [
            { paymentMethod: 'credit_card', amount: 129.99, status: 'pending' },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        userId: users[1].id,
        totalAmount: 69.98,
        status: 'completed',
        transactions: {
          create: [
            { paymentMethod: 'debit_card', amount: 69.98, status: 'success' },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        userId: users[2].id,
        totalAmount: 79.99,
        status: 'cancelled',
        transactions: {
          create: [
            { paymentMethod: 'credit_card', amount: 79.99, status: 'refunded' },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        userId: users[3].id,
        totalAmount: 239.97,
        status: 'completed',
        transactions: {
          create: [
            { paymentMethod: 'credit_card', amount: 200.00, status: 'success' },
            { paymentMethod: 'wallet', amount: 39.97, status: 'success' },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        userId: users[3].id,
        totalAmount: 34.99,
        status: 'shipped',
        transactions: {
          create: [
            { paymentMethod: 'paypal', amount: 34.99, status: 'success' },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        userId: users[4].id,
        totalAmount: 109.98,
        status: 'processing',
        transactions: {
          create: [
            { paymentMethod: 'credit_card', amount: 109.98, status: 'success' },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        userId: users[4].id,
        totalAmount: 59.99,
        status: 'completed',
        transactions: {
          create: [
            { paymentMethod: 'debit_card', amount: 59.99, status: 'success' },
          ],
        },
      },
    }),
  ]);

  console.log('Seed data created:');
  console.log(`- ${users.length} users`);
  console.log(`- ${products.length} products`);
  console.log(`- ${orders.length} orders with transactions`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });