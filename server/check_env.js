
require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log("Checking Environment...");

const required = [
    'SUPABASE_URL',
    'SUPABASE_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'SESSION_SECRET'
];

const missing = [];

required.forEach(key => {
    if (!process.env[key]) {
        missing.push(key);
    } else {
        console.log(`✅ ${key} is set`);
    }
});

if (missing.length > 0) {
    console.error("❌ Missing variables:", missing.join(', '));
    process.exit(1);
} else {
    console.log("✅ All required variables match.");
}

try {
    const supabase = require('./utils/supabaseClient');
    console.log("✅ Supabase client initialized.");
} catch (e) {
    console.error("❌ Supabase client failed:", e.message);
}

console.log("Done.");
