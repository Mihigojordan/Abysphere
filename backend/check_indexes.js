
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkIndexes() {
    try {
        const result = await prisma.$queryRaw`SHOW INDEX FROM Client`;
        console.log('Indexes on Client table:');
        console.table(result);
    } catch (error) {
        console.error('Error fetching indexes:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkIndexes();
