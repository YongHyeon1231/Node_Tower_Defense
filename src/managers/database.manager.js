import redisManager from './redis.manager.js';
import prismaManager from './prisma.manager.js';
import logger from '../libs/logger.js';

class DatabaseServiceManager {
  constructor(redis, prisma) {
    this.redis = redis;
    this.prisma = prisma;
  }

  /**
   * 공통 캐싱 및 데이터 조회 처리
   * @param {string} model - Prisma 모델 이름
   * @param {string} operation - 수행할 작업 (findMany, findUnique, findFirst)
   * @param {Object} queryArgs - 쿼리 매개변수
   * @param {number} [ttl=3600] - 캐시 유효 시간 (기본값: 3600초)
   * @returns {Promise<Object>} - 조회된 데이터
   */
  async cacheAndFetch(model, operation, queryArgs, ttl = 3600) {
    const cacheKey = this.generateCacheKey(model, operation, queryArgs);

    let cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      logger.info(`캐시 데이터 조회: ${cacheKey}`);
      return JSON.parse(cachedData);
    }

    const dbData = await this.prisma[model][operation](queryArgs);
    if (dbData) {
      await this.redis.set(cacheKey, JSON.stringify(dbData), ttl);
    }

    return dbData;
  }

  /**
   * 다수의 데이터를 조회하고 캐싱
   * @param {string} model - Prisma 모델 이름
   * @param {Object} queryArgs - 쿼리 매개변수
   * @param {number} [ttl=3600] - 캐시 유효 시간 (기본값: 3600초)
   * @returns {Promise<Array>} - 조회된 데이터 배열
   */
  async findMany(model, queryArgs, ttl = 3600) {
    return this.cacheAndFetch(model, 'findMany', queryArgs, ttl);
  }

  /**
   * 단일 데이터를 조회하고 캐싱
   * @param {string} model - Prisma 모델 이름
   * @param {Object} queryArgs - 쿼리 매개변수
   * @param {number} [ttl=3600] - 캐시 유효 시간 (기본값: 3600초)
   * @returns {Promise<Object|null>} - 조회된 데이터 객체 또는 null
   */
  async findUnique(model, queryArgs, ttl = 3600) {
    return this.cacheAndFetch(model, 'findUnique', queryArgs, ttl);
  }

  /**
   * 첫 번째 데이터를 조회하고 캐싱
   * @param {string} model - Prisma 모델 이름
   * @param {Object} queryArgs - 쿼리 매개변수
   * @param {number} [ttl=3600] - 캐시 유효 시간 (기본값: 3600초)
   * @returns {Promise<Object|null>} - 조회된 데이터 객체 또는 null
   */
  async findFirst(model, queryArgs, ttl = 3600) {
    return this.cacheAndFetch(model, 'findFirst', queryArgs, ttl);
  }

  /**
   * 데이터 생성 및 캐시 무효화
   * @param {string} model - Prisma 모델 이름
   * @param {Object} data - 생성할 데이터
   * @param {Array<string>} [cacheKeysToInvalidate=[]] - 무효화할 캐시 키 목록
   * @returns {Promise<Object>} - 생성된 데이터
   */
  async createData(model, data, cacheKeysToInvalidate = []) {
    const result = await this.prisma[model].create({ data });
    await this.invalidateMultipleKeys(cacheKeysToInvalidate);
    return result;
  }

  /**
   * 데이터 배치 업데이트 및 캐시 무효화
   * @param {string} model - Prisma 모델 이름
   * @param {Object} whereClause - 업데이트할 데이터의 조건
   * @param {Object} updateFields - 업데이트할 필드
   * @param {Array<string>} [cacheKeysToInvalidate=[]] - 무효화할 캐시 키 목록
   * @returns {Promise<Object>} - 업데이트 결과
   */
  async updateBatchData(model, whereClause, updateFields, cacheKeysToInvalidate = []) {
    const result = await this.prisma[model].updateMany({
      where: whereClause,
      data: updateFields,
    });
    await this.invalidateMultipleKeys(cacheKeysToInvalidate);
    return result;
  }

  /**
   * 트랜잭션 처리 및 다중 캐시 무효화
   * @param {Array<Function>} queries - 실행할 트랜잭션 쿼리 배열
   * @param {Array<string>} [cacheKeysToInvalidate=[]] - 무효화할 캐시 키 목록
   * @returns {Promise<Object>} - 트랜잭션 결과
   */
  async executeTransaction(queries, cacheKeysToInvalidate = []) {
    const result = await this.prisma.$transaction(queries);
    await this.invalidateMultipleKeys(cacheKeysToInvalidate);
    return result;
  }

  /**
   * 페이지네이션 지원 데이터 조회 및 캐싱
   * @param {string} model - Prisma 모델 이름
   * @param {number} [page=1] - 조회할 페이지 번호
   * @param {number} [limit=10] - 페이지당 데이터 개수
   * @param {string} cacheKeyPrefix - 캐시 키의 접두사
   * @returns {Promise<Array>} - 조회된 페이지 데이터 배열
   */
  async getPagedData(model, page = 1, limit = 10, cacheKeyPrefix) {
    const cacheKey = `${cacheKeyPrefix}_${page}_${limit}`;
    let cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      logger.info(`캐시에서 페이지 데이터 조회: ${cacheKey}`);
      return cachedData;
    }

    const skip = (page - 1) * limit;
    const dbData = await this.prisma[model].findMany({
      skip,
      take: limit,
    });

    await this.redis.set(cacheKey, dbData, 3600);
    return dbData;
  }

  /**
   * 고유 캐시 키 생성
   * @param {string} model - 모델 이름
   * @param {string} operation - 작업 종류
   * @param {Object} params - 쿼리 매개변수
   * @returns {string} - 생성된 캐시 키
   */
  generateCacheKey(model, operation, params) {
    return `${model}_${operation}_${JSON.stringify(params)}`;
  }

  /**
   * 여러 캐시 키를 무효화
   * @param {Array<string>} cacheKeys - 무효화할 캐시 키 배열
   * @returns {Promise<void>} - 무효화 완료 시 반환
   */
  async invalidateMultipleKeys(cacheKeys) {
    if (cacheKeys.length) {
      await Promise.all(cacheKeys.map((key) => this.redis.invalidate(key)));
    }
  }
}

const db = new DatabaseServiceManager(redisManager, prismaManager);
export default db;
