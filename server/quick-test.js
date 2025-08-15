import { spawn } from 'child_process';

console.log('🧪 Quick test: Starting server...');

const server = spawn('node', ['server.js'], {
    stdio: 'pipe'
});

let hasError = false;

server.stdout.on('data', (data) => {
    console.log('✅ Server output:', data.toString());
});

server.stderr.on('data', (data) => {
    hasError = true;
    console.log('❌ Server error:', data.toString());
});

server.on('close', (code) => {
    if (hasError) {
        console.log('❌ Server failed to start');
        process.exit(1);
    } else {
        console.log('✅ Server started successfully!');
        process.exit(0);
    }
});

// Kill after 2 seconds
setTimeout(() => {
    server.kill();
}, 2000);
