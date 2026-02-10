const { execSync } = require('child_process');

console.log('🔧 Testing build process...');

try {
  console.log('1. Installing dependencies...');
  execSync('npm ci', { stdio: 'inherit' });
  
  console.log('2. Building project...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build successful!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
