import logger from '../libs/logger.js';
import prisma from './prisma.manager.js';
import redis from './redis.manager.js';

class databaseServiceManager {
  constructor(prisma, redis) {
    this.prisma = prisma;
    this.redis = redis;
  }

  /**
   * 데이터 불러오는 함수
   *
   * @param {String} cacheKey 레디스에서 값이 있는지 검사하기위한 캐시 키
   * @param {function():dbData} dbQueryCallback 없을 경우 mysql에서 불러올 쿼리
   * @param {Number} ttl 레디스에 캐시를 저장할 기간
   * @returns cachedData
   */
  getData = async (cacheKey, dbQueryCallback, ttl = 3600) => {
    let cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`Cached Return : ${cacheKey} => ${cachedData}`);
      return JSON.parse(cachedData);
    }

    const dbData = await dbQueryCallback();
    if (dbData) {
      await this.saveCache(cacheKey, dbData);
    }

    return dbData;
  };

  setData = async (cacheKey, data, dbCallback) => {
    let jobs = [dbCallback(data), this.saveCache(cacheKey, data)];
    await Promise.all(jobs);
  };

  /** 데이터 업데이트 시 DB에 우선 작업 후, Redis 캐시 무효화
   *
   * @param {String} cacheKey
   * @param {function():dbData} dbUpdateCallback
   * @returns updatedData
   */
  update = async (cacheKey, dbUpdateCallback, invalidate = false) => {
    let updatedData = null;

    let jobs = [dbUpdateCallback];
    if (invalidate) {
      jobs.push(invalidatedCache(cacheKey));
    }

    await Promise.all(jobs);
    return updatedData;
  };

  /** 캐시 무효화
   *
   * @param {String} cacheKey
   */
  invalidatedCache = async (cacheKey) => {
    await redis.del(cacheKey);
  };

  transaction = async (cacheKey, dbTransactionCallback, invalidate = false) => {
    let result = null;

    let jobs = [
      prisma.$transaction(async (prisma) => {
        return await dbTransactionCallback(prisma);
      }),
    ];

    if (invalidate) {
      jobs.push(this.invalidatedCache(cacheKey));
    }
    await Promise.all(jobs);
    return result;
  };

  saveCache = async (cacheKey, data, ttl = 3600) => {
    return redis.set(cacheKey, JSON.stringify(data), { ttlType: 'EX', ttl });
  };
}

const db = new databaseServiceManager(prisma, redis);
export default db;
