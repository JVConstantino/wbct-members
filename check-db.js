
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const postCount = await prisma.post.count();
        const eventCount = await prisma.event.count();
        const userCount = await prisma.user.count();

        console.log('Counts:');
        console.log('Posts:', postCount);
        console.log('Events:', eventCount);
        console.log('Users:', userCount);

        if (postCount > 0) {
            const posts = await prisma.post.findMany({
                take: 5,
                include: { author: true }
            });
            console.log('Recent Posts:', JSON.stringify(posts, null, 2));
        }

        if (eventCount > 0) {
            const events = await prisma.event.findMany({
                take: 5
            });
            console.log('Upcoming Events:', JSON.stringify(events, null, 2));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
