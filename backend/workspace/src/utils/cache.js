class Cache {
    constructor() {
        if (Cache.instance) {
            return Cache.instance; 
        }

        this.store = new Map(); 
        this.sets = new Map();

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

    addEntryInSet(setName, value) {
        if (!this.sets.has(setName)) {
            this.sets.set(setName, new Set());
        }
        const set = this.sets.get(setName);
        set.add(value);
    }

    addEntriesInSet(setName, values) {
        if (!this.sets.has(setName)) {
            this.sets.set(setName, new Set());
        }
        const set = this.sets.get(setName);
        values.forEach(value => set.add(value));
    }

    deleteEntryInSet(setName, value) {
        if (!this.sets.has(setName)) return false;
        return this.sets.get(setName).delete(value);
    }

    getAllEntriesInSet(setName) {
        if (!this.sets.has(setName)) return [];
        return [...this.sets.get(setName)];
    }
}

const cache = new Cache();

export default cache;