import pg from 'pg'
import 'dotenv/config'
import bcrypt from 'bcryptjs'

async function main() {
  const connectionString = "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable"
  const pool = new pg.Pool({ connectionString })
  
  const email = 'admin@britsync.com'
  const password = 'adminpassword123'
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const client = await pool.connect()
    console.log('Connected to database directly via pg')
    
    // Check if user exists
    const res = await client.query('SELECT id FROM "User" WHERE email = $1', [email])
    
    if (res.rows.length > 0) {
      await client.query(
        'UPDATE "User" SET password = $1, role = $2 WHERE email = $3',
        [hashedPassword, 'ADMIN', email]
      )
      console.log('Admin user updated')
    } else {
      await client.query(
        'INSERT INTO "User" (id, email, password, role, status, "fullName", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())',
        [crypto.randomUUID(), email, hashedPassword, 'ADMIN', 'ACTIVE', 'System Admin']
      )
      console.log('Admin user created')
    }
    
    client.release()
  } catch (err) {
    console.error('Error inserting admin via pg:', err)
  } finally {
    await pool.end()
  }
}

main()
