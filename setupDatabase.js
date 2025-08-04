const db = require('./database.js');

// --- This is where you define all your glasses models ---
const glassesData = [
    {
        name: 'Classic Grey',
        color: 'grey',
        path: '/3d/Models/glasses/grey/grey.gltf'
    },
    {
        name: 'Classic Black',
        color: 'black',
        path: '/3d/Models/glasses/black/black.gltf'
    },
    {
        name: 'Classic Brown',
        color: 'brown',
        path: '/3d/Models/glasses/brown/brown.gltf'
    }
];
// ---------------------------------------------------------

console.log("Setting up the database...");

db.serialize(() => {
    // Create the 'glasses' table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS glasses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        color TEXT,
        path TEXT NOT NULL UNIQUE
    )`, (err) => {
        if (err) return console.error("Error creating table:", err.message);
        console.log("'glasses' table is ready.");

        // Use a prepared statement to insert data
        const insert = 'INSERT OR IGNORE INTO glasses (name, color, path) VALUES (?,?,?)';
        glassesData.forEach(glass => {
            db.run(insert, [glass.name, glass.color, glass.path], function(err) {
                if (err) return console.error("Error inserting data:", err.message);
                if (this.changes > 0) {
                    console.log(`Added model: ${glass.name}`);
                }
            });
        });
    });
});

console.log("Database setup script finished.");
db.close();
