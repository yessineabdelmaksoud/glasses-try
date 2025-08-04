const sqlite3 = require('sqlite3').verbose();
const DBSOURCE = "db.sqlite";

// This creates the db.sqlite file and connects to it.
const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      console.error(err.message);
      throw err;
    }
    console.log('Connected to the SQLite database.');
});

module.exports = db;
