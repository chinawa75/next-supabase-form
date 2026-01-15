import 'dotenv/config';
import { prisma } from './lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
    const username = 'admin';
    const rawPassword = 'password';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    console.log(`Creating admin user: ${username} with password: ${rawPassword}`);

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
        // We don't need to disconnect explicitly if using the shared instance, but good practice to let process exit
        /* await prisma.$disconnect(); */
        // Actually lib/prisma exports an instance. 
        process.exit(0);
    }
}

main();
