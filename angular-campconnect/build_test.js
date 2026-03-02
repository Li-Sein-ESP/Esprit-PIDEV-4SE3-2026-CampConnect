try {
    const { execSync } = require('child_process');
    execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
    console.error('Build failed');
}
