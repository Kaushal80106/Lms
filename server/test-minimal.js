import express from 'express';

const app = express();

// Basic middleware
app.use(express.json());

// Simple routes
app.get('/', (req, res) => {
    res.json({ message: 'Test server working' });
});

app.get('/test', (req, res) => {
    res.json({ message: 'Test route working' });
});

// Test parameter route
app.get('/test/:id', (req, res) => {
    res.json({ id: req.params.id });
});

console.log('🧪 Starting minimal test server...');

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`✅ Minimal test server running on port ${PORT}`);
    console.log('✅ No path-to-regexp errors detected');
});
