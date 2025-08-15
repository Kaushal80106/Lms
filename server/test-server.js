// Simple test to verify server starts without path-to-regexp errors
import { spawn } from 'child_process';

console.log('🧪 Testing server startup...');

const server = spawn('node', ['server.js'], {
    stdio: 'pipe',
    cwd: process.cwd()
});

let output = '';
let errorOutput = '';

server.stdout.on('data', (data) => {
    output += data.toString();
    console.log('✅ Server output:', data.toString());
});

server.stderr.on('data', (data) => {
    errorOutput += data.toString();
    console.log('❌ Server error:', data.toString());
});

server.on('close', (code) => {
    console.log(`\n📊 Server process exited with code ${code}`);
    
    if (code === 0) {
        console.log('✅ Server started successfully!');
    } else {
        console.log('❌ Server failed to start');
        console.log('Error output:', errorOutput);
    }
    
    process.exit(code);
});

// Kill server after 3 seconds
setTimeout(() => {
    console.log('🛑 Stopping server test...');
    server.kill();
}, 3000);
