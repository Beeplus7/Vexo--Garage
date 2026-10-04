import Redis from "ioredis";

type CacheStore = {
  get(key: string): Promise<string | null>;
  setex(key: string, ttl: number, value: string): Promise<"OK" | null>;
};

const memory = new Map<string, { value: string; expiresAt: number }>();

const memoryCache: CacheStore = {
  async get(key) {
    const hit = memory.get(key);
    if (!hit) return null;
    if (Date.now() > hit.expiresAt) {
      memory.delete(key);
      return null;
    }
    return hit.value;
  },
  async setex(key, ttl, value) {
    memory.set(key, { value, expiresAt: Date.now() + ttl * 1000 });
    return "OK";
  },
};

let redisClient: Redis | null = null;
let useMemory = false;

function getRedis(): CacheStore {
  if (useMemory) return memoryCache;

  if (!redisClient) {
    try {
      redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
        maxRetriesPerRequest: 1,
        lazyConnect: true,
        enableOfflineQueue: false,
      });
      redisClient.on("error", () => {
        useMemory = true;
      });
    } catch {
      useMemory = true;
      return memoryCache;
    }
  }

  return {
    async get(key) {
      try {
        if (redisClient!.status !== "ready") {
          await redisClient!.connect().catch(() => {
            useMemory = true;
          });
        }
        if (useMemory) return memoryCache.get(key);
        return await redisClient!.get(key);
      } catch {
        useMemory = true;
        return memoryCache.get(key);
      }
    },
    async setex(key, ttl, value) {
      try {
        if (redisClient!.status !== "ready") {
          await redisClient!.connect().catch(() => {
            useMemory = true;
          });
        }
        if (useMemory) return memoryCache.setex(key, ttl, value);
        return await redisClient!.setex(key, ttl, value);
      } catch {
        useMemory = true;
        return memoryCache.setex(key, ttl, value);
      }
    },
  };
}

export const redis = {
  get: (key: string) => getRedis().get(key),
  setex: (key: string, ttl: number, value: string) =>
    getRedis().setex(key, ttl, value),
};

export const CACHE_TTL = {
  vehicle: 60 * 60 * 24, // 24h
  mot: 60 * 60 * 12, // 12h
  postcode: 60 * 60 * 24 * 30, // 30d
  garages: 60 * 5, // 5m
};
