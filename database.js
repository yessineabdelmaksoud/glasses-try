const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', // Update this with your MySQL password if you have one
    database: 'virtual_glasses',
    port: 3306
};

// Create connection pool for better performance
const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
});

// Test the connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connected to MySQL database: virtual_glasses');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error connecting to MySQL database:', error.message);
        return false;
    }
}

// Get a connection from the pool
async function getConnection() {
    try {
        return await pool.getConnection();
    } catch (error) {
        console.error('Error getting database connection:', error.message);
        throw error;
    }
}

// Execute a query
async function query(sql, params = []) {
    let connection;
    try {
        connection = await getConnection();
        const [results] = await connection.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database query error:', error.message);
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

// Close the pool
async function closePool() {
    try {
        await pool.end();
        console.log('Database connection pool closed');
    } catch (error) {
        console.error('Error closing database pool:', error.message);
    }
}

// Export everything properly
module.exports = {
    pool,
    testConnection,
    getConnection,
    query,
    closePool,
    dbConfig
};
