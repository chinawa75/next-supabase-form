const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const username = 'admin';
    const rawPassword = 'password';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    try {
        const user = await prisma.admins.upsert({
            where: { username },
            update: { password: hashedPassword },
            create: {
                username,
                password: hashedPassword,
            },
        });
        console.log(`Admin user '${username}' created/updated successfully.`);
    } catch (e) {
        console.error('Error creating admin user:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
