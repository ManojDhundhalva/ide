class Cache {
    constructor() {
        if (Cache.instance) {
            return Cache.instance; // return existing instance (singleton)
        }

        this.store = new Map(); 
        Cache.instance = this;
    }

    set(key, value) {
        this.store.set(key, value);
    }

    get(key) {
        return this.store.get(key);
    }

    has(key) {
        return this.store.has(key);
    }

    delete(key) {
        return this.store.delete(key);
    }

    clear() {
        this.store.clear();
    }

    scheduleClear(intervalMs) {
        setInterval(() => {
            this.clear();
            console.log("Cache cleared on schedule");
        }, intervalMs);
    }
}

const cache = new Cache();

cache.scheduleClear(6 * 60 * 60 * 1000); // clear every 6 hour

export default cache;