const mysql = require('mysql2/promise');

// --- This is where you define all your glasses models ---
const glassesData = [
    {
        description: 'Classic Grey - Elegant grey frame glasses with modern design',
        photo_path: '/images/glasses/grey-preview.jpg',
        gltf_path: '/3d/Models/glasses/grey/grey.gltf'
    },
    {
        description: 'Classic Black - Sleek black frame glasses for professional look',
        photo_path: '/images/glasses/black-preview.jpg',
        gltf_path: '/3d/Models/glasses/black/black.gltf'
    },
    {
        description: 'Classic Brown - Warm brown frame glasses with vintage appeal',
        photo_path: '/images/glasses/brown-preview.jpg',
        gltf_path: '/3d/Models/glasses/brown/brown.gltf'
    }
];
// ---------------------------------------------------------

async function setupDatabase() {
    console.log("🚀 Setting up the MySQL database...");

    let connection;
    try {
        // Create connection
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'virtual_glasses',
            port: 3306
        });

        console.log("✅ Connected to MySQL database: virtual_glasses");
        console.log("📋 Setting up database tables...");

        // Create the 'glasses' table if it doesn't exist
        const createGlassesTable = `
            CREATE TABLE IF NOT EXISTS glasses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                description TEXT NOT NULL,
                photo_path VARCHAR(255) NOT NULL,
                gltf_path VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await connection.execute(createGlassesTable);
        console.log("✅ 'glasses' table is ready.");

        // Create the 'guest_images' table if it doesn't exist
        const createGuestImagesTable = `
            CREATE TABLE IF NOT EXISTS guest_images (
                id INT AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255) NOT NULL,
                path VARCHAR(255) NOT NULL,
                ip_address VARCHAR(45),
                glasses_id INT,
                token VARCHAR(64) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (glasses_id) REFERENCES glasses(id) ON DELETE SET NULL
            )
        `;

        await connection.execute(createGuestImagesTable);
        console.log("✅ 'guest_images' table is ready.");

        // Insert glasses data
        console.log("👓 Adding glasses models...");
        
        for (const glass of glassesData) {
            try {
                // Check if glasses already exists
                const [existing] = await connection.execute(
                    'SELECT id FROM glasses WHERE gltf_path = ?', 
                    [glass.gltf_path]
                );

                if (existing.length === 0) {
                    await connection.execute(
                        'INSERT INTO glasses (description, photo_path, gltf_path) VALUES (?, ?, ?)',
                        [glass.description, glass.photo_path, glass.gltf_path]
                    );
                    console.log(`✅ Added model: ${glass.description}`);
                } else {
                    console.log(`⚠️  Model already exists: ${glass.description}`);
                }
            } catch (error) {
                console.error(`❌ Error adding model ${glass.description}:`, error.message);
            }
        }

        console.log("🎉 Database setup completed successfully!");
        
        // Display current glasses count
        const [count] = await connection.execute('SELECT COUNT(*) as total FROM glasses');
        console.log(`📊 Total glasses models in database: ${count[0].total}`);

    } catch (error) {
        console.error("❌ Database setup failed:", error.message);
        console.log("\n📋 Troubleshooting steps:");
        console.log("1. Make sure XAMPP is running");
        console.log("2. Start MySQL service in XAMPP Control Panel");
        console.log("3. Check if database 'virtual_glasses' exists");
        console.log("4. Verify MySQL credentials (user: root, password: empty)");
    } finally {
        // Close the database connection
        if (connection) {
            await connection.end();
            console.log("📝 Database connection closed.");
        }
    }
}

// Run the setup
setupDatabase();
