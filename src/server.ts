import app from './app';
import { config } from './config';
import prisma from './config/database';

async function main() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Start server
    app.listen(config.port, () => {
      console.log(`
╔══════════════════════════════════════════════════╗
║        🏦 Finance Dashboard Backend API         ║
╠══════════════════════════════════════════════════╣
║  Status:      Running                           ║
║  Port:        ${String(config.port).padEnd(35)}║
║  Environment: ${config.nodeEnv.padEnd(35)}║
║  API Base:    http://localhost:${config.port}/api${' '.repeat(13)}║
╠══════════════════════════════════════════════════╣
║  Endpoints:                                     ║
║    POST   /api/auth/register                    ║
║    POST   /api/auth/login                       ║
║    GET    /api/auth/profile                     ║
║    GET    /api/users                            ║
║    GET    /api/records                          ║
║    GET    /api/dashboard/summary                ║
║    GET    /api/health                           ║
╚══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

main();
