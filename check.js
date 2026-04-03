const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.artist.findFirst({ where: { name: 'spcmsk' } }).then(a => { console.log(a); process.exit(0); });
