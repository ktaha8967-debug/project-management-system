import prisma from '../src/backend/lib/prisma'

async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@britsync.com' }
    })
    console.log('User found:', user ? user.email : 'null')
    
    const projects = await prisma.project.findMany()
    console.log('Projects count:', projects.length)
    
    const tasks = await prisma.task.findMany()
    console.log('Tasks count:', tasks.length)
    
  } catch (err) {
    console.error('Error in test-prisma:', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
