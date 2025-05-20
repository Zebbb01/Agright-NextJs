import { PrismaClient } from '@prisma/client';
import { UserSeeder } from './seeder/UserSeeder';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  await UserSeeder.seed();
  console.log('🌱 Seeding completed.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
