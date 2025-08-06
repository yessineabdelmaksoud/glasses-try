const db = require('./database.js');
const crypto = require('crypto');

/**
 * Database API helper functions for the Virtual Glasses Try-On application
 */

class GlassesDB {
    /**
     * Get all available glasses models
     * @returns {Promise<Array>} Array of glasses objects
     */
    static async getAllGlasses() {
        try {
            const glasses = await db.query('SELECT * FROM glasses ORDER BY created_at ASC');
            return glasses;
        } catch (error) {
            console.error('Error fetching glasses:', error.message);
            throw error;
        }
    }

    /**
     * Get a specific glasses model by ID
     * @param {number} id - Glasses ID
     * @returns {Promise<Object|null>} Glasses object or null if not found
     */
    static async getGlassesById(id) {
        try {
            const glasses = await db.query('SELECT * FROM glasses WHERE id = ?', [id]);
            return glasses.length > 0 ? glasses[0] : null;
        } catch (error) {
            console.error('Error fetching glasses by ID:', error.message);
            throw error;
        }
    }

    /**
     * Add a new glasses model
     * @param {Object} glassesData - Glasses data object
     * @param {string} glassesData.description - Glasses description
     * @param {string} glassesData.photo_path - Path to preview photo
     * @param {string} glassesData.gltf_path - Path to GLTF model
     * @returns {Promise<number>} ID of the newly created glasses
     */
    static async addGlasses(glassesData) {
        try {
            const { description, photo_path, gltf_path } = glassesData;
            const result = await db.query(
                'INSERT INTO glasses (description, photo_path, gltf_path) VALUES (?, ?, ?)',
                [description, photo_path, gltf_path]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error adding glasses:', error.message);
            throw error;
        }
    }

    /**
     * Update an existing glasses model
     * @param {number} id - Glasses ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<boolean>} True if updated successfully
     */
    static async updateGlasses(id, updateData) {
        try {
            const { description, photo_path, gltf_path } = updateData;
            const result = await db.query(
                'UPDATE glasses SET description = ?, photo_path = ?, gltf_path = ? WHERE id = ?',
                [description, photo_path, gltf_path, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating glasses:', error.message);
            throw error;
        }
    }

    /**
     * Delete a glasses model
     * @param {number} id - Glasses ID
     * @returns {Promise<boolean>} True if deleted successfully
     */
    static async deleteGlasses(id) {
        try {
            const result = await db.query('DELETE FROM glasses WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting glasses:', error.message);
            throw error;
        }
    }
}

class GuestImagesDB {
    /**
     * Generate a unique token for guest image tracking
     * @returns {string} Random token
     */
    static generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Save a guest uploaded image record
     * @param {Object} imageData - Image data object
     * @param {string} imageData.filename - Original filename
     * @param {string} imageData.path - Stored file path
     * @param {string} imageData.ip_address - Client IP address
     * @param {number|null} imageData.glasses_id - Associated glasses ID
     * @returns {Promise<Object>} Created image record with token
     */
    static async saveGuestImage(imageData) {
        try {
            const { filename, path, ip_address, glasses_id } = imageData;
            const token = this.generateToken();
            
            const result = await db.query(
                'INSERT INTO guest_images (filename, path, ip_address, glasses_id, token) VALUES (?, ?, ?, ?, ?)',
                [filename, path, ip_address, glasses_id, token]
            );

            return {
                id: result.insertId,
                token,
                ...imageData
            };
        } catch (error) {
            console.error('Error saving guest image:', error.message);
            throw error;
        }
    }

    /**
     * Get guest image by token
     * @param {string} token - Image token
     * @returns {Promise<Object|null>} Image record or null if not found
     */
    static async getImageByToken(token) {
        try {
            const images = await db.query('SELECT * FROM guest_images WHERE token = ?', [token]);
            return images.length > 0 ? images[0] : null;
        } catch (error) {
            console.error('Error fetching image by token:', error.message);
            throw error;
        }
    }

    /**
     * Get all guest images (for admin purposes)
     * @param {number} limit - Maximum number of records to return
     * @param {number} offset - Number of records to skip
     * @returns {Promise<Array>} Array of image records
     */
    static async getAllGuestImages(limit = 50, offset = 0) {
        try {
            const images = await db.query(
                `SELECT gi.*, g.description as glasses_description 
                 FROM guest_images gi 
                 LEFT JOIN glasses g ON gi.glasses_id = g.id 
                 ORDER BY gi.created_at DESC 
                 LIMIT ? OFFSET ?`,
                [limit, offset]
            );
            return images;
        } catch (error) {
            console.error('Error fetching guest images:', error.message);
            throw error;
        }
    }

    /**
     * Delete old guest images (cleanup function)
     * @param {number} daysOld - Delete images older than this many days
     * @returns {Promise<number>} Number of deleted records
     */
    static async deleteOldImages(daysOld = 30) {
        try {
            const result = await db.query(
                'DELETE FROM guest_images WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
                [daysOld]
            );
            return result.affectedRows;
        } catch (error) {
            console.error('Error deleting old images:', error.message);
            throw error;
        }
    }
}

class DatabaseUtils {
    /**
     * Get database statistics
     * @returns {Promise<Object>} Database statistics
     */
    static async getStats() {
        try {
            const [glassesCount] = await db.query('SELECT COUNT(*) as count FROM glasses');
            const [imagesCount] = await db.query('SELECT COUNT(*) as count FROM guest_images');
            const [recentImages] = await db.query(
                'SELECT COUNT(*) as count FROM guest_images WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)'
            );

            return {
                totalGlasses: glassesCount.count,
                totalGuestImages: imagesCount.count,
                recentImages: recentImages.count,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting database stats:', error.message);
            throw error;
        }
    }

    /**
     * Test database connection
     * @returns {Promise<boolean>} True if connection is successful
     */
    static async testConnection() {
        return await db.testConnection();
    }

    /**
     * Initialize database tables (run during setup)
     * @returns {Promise<boolean>} True if initialization is successful
     */
    static async initializeTables() {
        try {
            // This would be called by setupDatabase.js
            return true;
        } catch (error) {
            console.error('Error initializing tables:', error.message);
            return false;
        }
    }
}

module.exports = {
    GlassesDB,
    GuestImagesDB,
    DatabaseUtils,
    db
};
