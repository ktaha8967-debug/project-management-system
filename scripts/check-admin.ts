import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@britsync.com' },
    update: {},
    create: {
      email: 'admin@britsync.com',
      fullName: 'System Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })
  console.log('Admin user:', admin)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
