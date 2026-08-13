import prisma from '../src/backend/lib/prisma'
import 'dotenv/config'
import bcrypt from 'bcryptjs'

async function main() {
  const email = 'admin@britsync.com'
  const password = 'adminpassword123'
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
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
    })
    console.log('Admin user created/updated:', admin.email)
    console.log('Login Email:', email)
    console.log('Login Password:', password)
  } catch (err) {
    console.error('Error creating admin:', err)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
