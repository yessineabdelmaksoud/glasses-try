const mysql = require('mysql2/promise');

async function testMySQLConnection() {
    console.log("🔍 Testing MySQL connection...");
    
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            port: 3306
        });
        
        console.log("✅ Successfully connected to MySQL!");
        
        // Try to create database if it doesn't exist
        await connection.execute('CREATE DATABASE IF NOT EXISTS virtual_glasses');
        console.log("✅ Database 'virtual_glasses' is ready!");
        
        await connection.end();
        return true;
    } catch (error) {
        console.error("❌ MySQL connection failed:", error.message);
        console.log("\n📋 Troubleshooting steps:");
        console.log("1. Make sure XAMPP is running");
        console.log("2. Start MySQL service in XAMPP Control Panel");
        console.log("3. Check if MySQL is running on port 3306");
        console.log("4. Verify MySQL user 'root' exists with no password");
        return false;
    }
}

testMySQLConnection();
