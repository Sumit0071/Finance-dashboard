import * as bcrypt from 'bcryptjs';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

// Dynamically load the Prisma instance depending on if we are in TS Dev or JS Prod
const isProd = fs.existsSync(path.join(__dirname, '../dist/config/database.js'));
const prisma = isProd 
  ? require('../dist/config/database.js').default 
  : require('../src/config/database.ts').default;

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.financialRecord.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const analystPassword = await bcrypt.hash('analyst123', 10);
  const viewerPassword = await bcrypt.hash('viewer123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@zorvyn.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const analyst = await prisma.user.create({
    data: {
      email: 'analyst@zorvyn.com',
      password: analystPassword,
      name: 'Analyst User',
      role: 'ANALYST',
      status: 'ACTIVE',
    },
  });

  const viewer = await prisma.user.create({
    data: {
      email: 'viewer@zorvyn.com',
      password: viewerPassword,
      name: 'Viewer User',
      role: 'VIEWER',
      status: 'ACTIVE',
    },
  });

  // Create financial records
  const records = [
    // Income records
    { amount: 85000, type: 'INCOME', category: 'Salary', date: new Date('2026-01-15'), description: 'January salary' },
    { amount: 85000, type: 'INCOME', category: 'Salary', date: new Date('2026-02-15'), description: 'February salary' },
    { amount: 85000, type: 'INCOME', category: 'Salary', date: new Date('2026-03-15'), description: 'March salary' },
    { amount: 15000, type: 'INCOME', category: 'Freelance', date: new Date('2026-01-20'), description: 'Freelance web development project' },
    { amount: 25000, type: 'INCOME', category: 'Freelance', date: new Date('2026-02-10'), description: 'Mobile app contract' },
    { amount: 5000, type: 'INCOME', category: 'Investments', date: new Date('2026-01-28'), description: 'Dividend payout from stocks' },
    { amount: 8000, type: 'INCOME', category: 'Investments', date: new Date('2026-03-01'), description: 'Mutual fund returns' },

    // Expense records
    { amount: 25000, type: 'EXPENSE', category: 'Rent', date: new Date('2026-01-05'), description: 'Monthly apartment rent' },
    { amount: 25000, type: 'EXPENSE', category: 'Rent', date: new Date('2026-02-05'), description: 'Monthly apartment rent' },
    { amount: 25000, type: 'EXPENSE', category: 'Rent', date: new Date('2026-03-05'), description: 'Monthly apartment rent' },
    { amount: 3500, type: 'EXPENSE', category: 'Utilities', date: new Date('2026-01-10'), description: 'Electricity and water bill' },
    { amount: 4200, type: 'EXPENSE', category: 'Utilities', date: new Date('2026-02-10'), description: 'Electricity, water and internet' },
    { amount: 3800, type: 'EXPENSE', category: 'Utilities', date: new Date('2026-03-10'), description: 'Utility bills' },
    { amount: 8000, type: 'EXPENSE', category: 'Groceries', date: new Date('2026-01-08'), description: 'Monthly grocery shopping' },
    { amount: 7500, type: 'EXPENSE', category: 'Groceries', date: new Date('2026-02-08'), description: 'Monthly grocery shopping' },
    { amount: 9000, type: 'EXPENSE', category: 'Groceries', date: new Date('2026-03-08'), description: 'Monthly grocery shopping' },
    { amount: 2000, type: 'EXPENSE', category: 'Transport', date: new Date('2026-01-12'), description: 'Metro pass and fuel' },
    { amount: 2500, type: 'EXPENSE', category: 'Transport', date: new Date('2026-02-12'), description: 'Travel expenses' },
    { amount: 5000, type: 'EXPENSE', category: 'Entertainment', date: new Date('2026-01-25'), description: 'Movies and dining out' },
    { amount: 3000, type: 'EXPENSE', category: 'Entertainment', date: new Date('2026-02-14'), description: 'Valentine dinner' },
    { amount: 12000, type: 'EXPENSE', category: 'Healthcare', date: new Date('2026-02-20'), description: 'Health checkup and medicines' },
    { amount: 15000, type: 'EXPENSE', category: 'Education', date: new Date('2026-01-02'), description: 'Online course subscription' },
    { amount: 6000, type: 'EXPENSE', category: 'Education', date: new Date('2026-03-18'), description: 'Technical book purchases' },
  ];

  for (const record of records) {
    await prisma.financialRecord.create({
      data: {
        ...record,
        createdById: admin.id,
      },
    });
  }

  console.log(`✅ Created 3 users`);
  console.log(`✅ Created ${records.length} financial records`);
  console.log('\n📧 Test accounts:');
  console.log('  Admin:   admin@zorvyn.com   / admin123');
  console.log('  Analyst: analyst@zorvyn.com / analyst123');
  console.log('  Viewer:  viewer@zorvyn.com  / viewer123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
