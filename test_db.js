const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const data = await prisma.aboutContent.findMany();
  console.log('AboutContent:', data);
}
check().catch(console.error).finally(() => prisma.$disconnect());
