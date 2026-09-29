const fs = require('fs');
const path = require('path');
const db = require('./db');

async function seed() {
  try {
    console.log('Reading init.sql...');
    const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    
    console.log('Executing init.sql...');
    await db.query(sql);
    
    console.log('Database initialized successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
}

seed();
