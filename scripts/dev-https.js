// Simple HTTPS development server for mobile testing
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting HTTPS development server...');

// Start Vite with HTTPS
const vite = spawn('npm', ['run', 'dev', '--', '--https', '--host', '0.0.0.0'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

vite.on('error', (error) => {
  console.error('Failed to start Vite:', error);
});

vite.on('close', (code) => {
  console.log(`Vite process exited with code ${code}`);
});

console.log('📱 Your app will be available at:');
console.log('   Local:    https://localhost:8100');
console.log('   Network:  https://[your-ip]:8100');
console.log('');
console.log('⚠️  Your browser will show a security warning due to self-signed certificate.');
console.log('   Click "Advanced" → "Proceed to localhost" (or your IP)');
console.log('   This is safe for development and allows Service Workers to work.');
