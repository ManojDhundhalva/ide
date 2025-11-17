class Cache {
    constructor() {
        if (Cache.instance) {
            return Cache.instance; // return existing instance (singleton)
        }

        this.store = new Map(); // key-value store
        Cache.instance = this;
    }

    // Set a value
    set(key, value) {
        this.store.set(key, value);
    }

    // Get a value
    get(key) {
        return this.store.get(key);
    }

    // Check if key exists
    has(key) {
        return this.store.has(key);
    }

    // Delete a key
    delete(key) {
        return this.store.delete(key);
    }

    // Clear all keys
    clear() {
        this.store.clear();
    }
}

const cache = new Cache();

export default cache;