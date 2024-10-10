import redisManager from './redis.manager.js';
import prismaManager from './prisma.manager.js';
import logger from '../libs/logger.js';

class DatabaseServiceManager {
  constructor(redis, prisma) {
    this.redis = redis;
    this.prisma = prisma;
  }

  /**
   * 캐시 그룹 생성 (id 또는 조건 기반 자동 생성)
   * @param {string} model - Prisma 모델 이름
   * @param {Object} params - 쿼리 매개변수 (id 또는 조건)
   * @returns {string} - 자동 생성된 캐시 그룹
   */
  generateCacheGroup(model, params) {
    if (params.id) {
      return `${model}_group_${params.id}`; // ID 기반 캐시 그룹
    }
    return `${model}_group_${JSON.stringify(params)}`; // 조건 기반 캐시 그룹
  }

  /**
   * 캐시 저장 및 자동 그룹화
   * @param {string} cacheKey - 저장할 캐시 키
   * @param {Object} data - 저장할 데이터
   * @param {string} group - 자동 생성된 캐시 그룹
   * @param {number} [ttl=3600] - 캐시 유효 시간 (기본값: 3600초)
   */
  async setCache(cacheKey, group, data, ttl = 3600) {
    await this.redis.set(cacheKey, JSON.stringify(data), ttl);
    await this.redis.sAdd(group, cacheKey);
  }

  /**
   * 그룹화된 캐시 무효화 (자동 그룹화 기반)
   * @param {string} model - Prisma 모델 이름
   * @param {Object} params - 쿼리 매개변수 (id 또는 조건 기반)
   */
  async invalidateGroupCache(model, params) {
    const group = this.generateCacheGroup(model, params);
    const cacheKeys = await this.redis.sMembers(group);
    if (cacheKeys.length) {
      await Promise.all(cacheKeys.map((key) => this.redis.invalidate(key)));
      await this.redis.del(group);
    }
  }

  /**
   * CRUD 작업 - 자동 그룹 관리 기반 캐시 무효화
   * @param {string} model - Prisma 모델 이름
   * @param {Object} data - 생성 또는 업데이트할 데이터
   */
  async createData(model, data) {
    const result = await this.prisma[model].create({ data });

    await this.invalidateGroupCache(model, { id: result.id });

    return result;
  }

  async updateBatchData(model, whereClause, updateFields) {
    const result = await this.prisma[model].updateMany({
      where: whereClause,
      data: updateFields,
    });

    await this.invalidateGroupCache(model, whereClause);

    return result;
  }

  async deleteData(model, whereClause) {
    const result = await this.prisma[model].deleteMany({
      where: whereClause,
    });

    await this.invalidateGroupCache(model, whereClause);

    return result;
  }

  async findMany(model, queryArgs, ttl = 3600) {
    const cacheKey = this.generateCacheKey(model, 'findMany', queryArgs);
    const group = this.generateCacheGroup(model, queryArgs); // 자동 그룹 생성

    let cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const dbData = await this.prisma[model].findMany(queryArgs);
    if (dbData) {
      await this.setCache(cacheKey, group, dbData, ttl);
    }

    return dbData;
  }

  async findUnique(model, queryArgs, ttl = 3600) {
    const cacheKey = this.generateCacheKey(model, 'findUnique', queryArgs);
    const group = this.generateCacheGroup(model, queryArgs); // 자동 그룹 생성

    let cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const dbData = await this.prisma[model].findUnique(queryArgs);
    if (dbData) {
      await this.setCache(cacheKey, group, dbData, ttl);
    }

    return dbData;
  }

  async findFirst(model, queryArgs, ttl = 3600) {
    const cacheKey = this.generateCacheKey(model, 'findFirst', queryArgs);
    const group = this.generateCacheGroup(model, queryArgs); // 자동 그룹 생성

    let cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const dbData = await this.prisma[model].findFirst(queryArgs);
    if (dbData) {
      await this.setCache(cacheKey, group, dbData, ttl);
    }

    return dbData;
  }

  generateCacheKey(model, operation, params) {
    return `${model}_${operation}_${JSON.stringify(params)}`;
  }
}

const db = new DatabaseServiceManager(redisManager, prismaManager);
export default db;
