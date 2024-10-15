import Redis from 'ioredis';
import env from '../libs/env.js';
import logger from '../libs/logger.js';

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = env;

class RedisServiceManager {
  constructor() {
    this.client = null;
  }

  async connect() {
    if (this.client === null) {
      try {
        this.client = new Redis({
          host: REDIS_HOST,
          port: REDIS_PORT,
          password: REDIS_PASSWORD,
          autoResubscribe: true,
          retryStrategy: (times) => {
            const delay = Math.min(times * 100, 3000); // 재시도 지연 시간 설정
            logger.info(`Redis 재연결 시도 중... ${times}회차 시도, ${delay}ms 후 재연결 시도`);
            return delay;
          },
        });
        logger.info('Redis 연결 성공');
      } catch (error) {
        logger.error('Redis 연결 실패:', error);
        this.client = null;
        throw new Error('Redis 연결 실패로 더 이상 재시도하지 않습니다.');
      }
    }
  }
  // Redis 기본 명령어
  async set(key, value, ttl = 3600) {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;
    return this.client.set(key, stringValue, 'EX', ttl);
  }

  async get(key) {
    const value = await this.client.get(key);
    return JSON.parse(value);
  }

  // Hash 데이터 명령어
  async hSet(key, fields) {
    const data = typeof fields === 'object' ? JSON.stringify(fields) : fields;
    return this.client.hset(key, fields);
  }

  async hSet(key, field, value) {
    const data = typeof value === 'object' ? JSON.stringify(value) : value;
    return this.client.hset(key, field, data);
  }

  async hGet(key, field) {
    let data = await this.client.hget(key, field);
    return JSON.parse(data);
  }

  async hGetAll(key) {
    let data = await this.client.hgetall(key);
    if (Object.keys(data).length === 0) {
      return null;
    }
    return data;
  }

  // List 데이터 명령어
  async rPush(key, ...values) {
    return this.client.rpush(key, ...values);
  }

  async lPop(key) {
    return this.client.lpop(key);
  }

  // Set 데이터 명령어
  async sAdd(key, ...members) {
    return this.client.sadd(key, ...members);
  }

  async sMembers(key) {
    return this.client.smembers(key);
  }

  // Sorted Set 명령어
  async zAdd(key, score, member) {
    return this.client.zadd(key, score, member);
  }

  async zRange(key, start, stop) {
    return this.client.zrange(key, start, stop);
  }

  // 캐시 무효화
  async invalidate(keys) {
    if (!Array.isArray(keys)) {
      keys = [keys];
    }
    return await this.client.del(keys);
  }

  // 트랜잭션 처리
  async transaction(commands) {
    const pipeline = this.client.multi();
    commands.forEach((cmd) => {
      pipeline[cmd.type](...cmd.args);
    });
    return pipeline.exec();
  }

  // TTL 확인
  async ttl(key) {
    return this.client.ttl(key);
  }

  //해당 키의 값이 있는지 검사
  async exists(keys) {
    if (!Array.isArray(keys)) {
      keys = [keys];
    }
    return this.client.exists(keys);
  }

  async unlink(keys) {
    if (!Array.isArray(keys)) {
      keys = [keys];
    }
    return this.client.unlink(...keys);
  }
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      logger.info('Redis 연결 종료');
    }
  }
}

const redisServiceManager = new RedisServiceManager();
export default redisServiceManager;
