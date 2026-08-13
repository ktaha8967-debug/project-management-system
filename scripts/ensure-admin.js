const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const url = 'file:' + path.resolve(__dirname, '../dev.db');
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'admin@britsync.com';
  const password = 'adminpassword123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      email,
      fullName: 'System Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
      password: hashedPassword,
    },
  });
  console.log('Admin user ready:', admin.email, 'ID:', admin.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
