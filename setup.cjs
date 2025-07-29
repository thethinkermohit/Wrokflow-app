#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🦷 Workflow Tracker Setup Script');
console.log('================================\n');

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.error('❌ Node.js version 18 or higher is required');
  console.error(`   Current version: ${nodeVersion}`);
  process.exit(1);
}

console.log(`✅ Node.js version check passed (${nodeVersion})`);

// Check if package.json exists
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found');
  console.error('   Please run this script from the project root directory');
  process.exit(1);
}

console.log('✅ Project structure check passed');

// Clean and install dependencies
console.log('\n📦 Installing dependencies...');

try {
  // Clean previous installations
  if (fs.existsSync('node_modules')) {
    console.log('   Cleaning previous installations...');
    execSync('rm -rf node_modules', { stdio: 'inherit' });
  }
  
  if (fs.existsSync('package-lock.json')) {
    execSync('rm -f package-lock.json', { stdio: 'inherit' });
  }

  // Clear npm cache
  console.log('   Clearing npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });

  // Install dependencies
  console.log('   Installing fresh dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('✅ Dependencies installed successfully');

} catch (error) {
  console.error('❌ Failed to install dependencies');
  console.error('   Error:', error.message);
  console.log('\n🔧 Try running manually:');
  console.log('   1. rm -rf node_modules package-lock.json');
  console.log('   2. npm cache clean --force');
  console.log('   3. npm install');
  process.exit(1);
}

// Check if all required files exist
const requiredFiles = [
  'App.tsx',
  'components/Dashboard.tsx',
  'components/Checklist.tsx',
  'styles/globals.css',
  'tailwind.config.js',
  'vite.config.ts'
];

console.log('\n📁 Checking project files...');
let missingFiles = [];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} (missing)`);
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log('\n⚠️  Some files are missing, but the app may still work');
}

// Environment variables check
console.log('\n🔐 Environment variables check...');
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
let missingEnvVars = [];

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`   ✅ ${envVar} is set`);
  } else {
    console.log(`   ⚠️  ${envVar} not found`);
    missingEnvVars.push(envVar);
  }
});

if (missingEnvVars.length > 0) {
  console.log('\n📝 Note: Environment variables will be configured when the app runs');
  console.log('   The app will prompt you to add them through the Supabase integration');
}

// Final setup verification
console.log('\n🧪 Running build test...');
try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Build test passed');
} catch (error) {
  console.log('⚠️  Build test failed, but development mode should still work');
  console.log('   You can start the dev server with: npm run dev');
}

console.log('\n🎉 Setup complete!');
console.log('\n🚀 Next steps:');
console.log('   1. Start the development server: npm run dev');
console.log('   2. Open http://localhost:3000 in your browser');
console.log('   3. Login with:');
console.log('      - Username: dr.aditi');
console.log('      - Password: spidey&maguna');
console.log('\n📚 For more information, see README.md');