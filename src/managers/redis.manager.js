import Redis from 'ioredis';
import env from '../libs/env.js';
import logger from '../libs/logger.js';

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = env;

class RedisServiceManager {
  constructor() {
    this.client = null;
    this.queue = [];
    this.isProcessing = false;
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
        logger.info('Redis 연결');
      } catch (error) {
        console.error('Redis 연결 실패:', error);
        this.client = null;
        throw new Error('Redis 연결 실패로 더 이상 재시도하지 않습니다.');
      }
    }
  }

  enqueueCommand(commandFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ commandFn, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const { commandFn, resolve, reject } = this.queue.shift();

      try {
        const result = await commandFn();
        resolve(result);
      } catch (error) {
        console.error('Redis processQueue error:', commandFn.toString());
        reject(error);
      }
    }

    this.isProcessing = false;
  }

  async keys(pattern) {
    return this.enqueueCommand(() => this.client.keys(pattern));
  }

  // String Commands
  async set(key, value, options = null) {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;
    const args = [key, stringValue];
    if (options) {
      Object.entries(options).forEach(([option, value]) => {
        args.push(value);
      });
    }
    return this.enqueueCommand(() => {
      return this.client.set(...args);
    });
  }

  async get(key) {
    return this.enqueueCommand(() => this.client.get(key));
  }

  async setEx(key, value, seconds) {
    return this.enqueueCommand(() => this.client.setex(key, seconds, value));
  }

  async del(...keys) {
    return this.enqueueCommand(() => this.client.del(...keys));
  }

  // Hash Commands
  async hSet(key, field, value) {
    if (typeof field === 'object') {
      return this.enqueueCommand(() => this.client.hset(key, field)); // field is an object
    } else {
      return this.enqueueCommand(() => this.client.hset(key, field, value)); // field is a single field
    }
  }

  async hLen(key) {
    return this.enqueueCommand(() => this.client.hlen(key));
  }

  async hGet(key, field) {
    return this.enqueueCommand(() => this.client.hget(key, field));
  }

  async hGetAll(key) {
    return this.enqueueCommand(() => this.client.hgetall(key));
  }

  async hDel(key, ...fields) {
    return this.enqueueCommand(() => this.client.hdel(key, ...fields));
  }

  // List Commands
  async rPush(key, ...values) {
    return this.enqueueCommand(() => this.client.rpush(key, ...values));
  }

  async lPop(key) {
    return this.enqueueCommand(() => this.client.lpop(key));
  }

  async rPop(key) {
    return this.enqueueCommand(() => this.client.rpop(key));
  }

  // Set Commands
  async sAdd(key, ...members) {
    return this.enqueueCommand(() => this.client.sadd(key, ...members));
  }

  async sMembers(key) {
    return this.enqueueCommand(() => this.client.smembers(key));
  }

  async sRem(key, ...members) {
    return this.enqueueCommand(() => this.client.srem(key, ...members));
  }

  async zAdd(key, score, member) {
    return this.enqueueCommand(() => this.client.zadd(key, score, member));
  }

  async zRange(key, start, stop, options = {}) {
    const args = [key, start, stop];

    if (options.WITHSCORES) {
      args.push('WITHSCORES');
    }

    if (options.REV) {
      return this.enqueueCommand(() => this.client.zrevrange(...args)); // 내림차순
    }

    return this.enqueueCommand(() => this.client.zrange(...args)); // 기본 (오름차순)
  }

  async zRem(key, ...members) {
    return this.enqueueCommand(() => this.client.zrem(key, ...members));
  }

  // Other Common Commands
  async exists(...keys) {
    return this.enqueueCommand(() => this.client.exists(...keys));
  }

  async incr(key) {
    return this.enqueueCommand(() => this.client.incr(key));
  }

  async incrBy(key, increment) {
    return this.enqueueCommand(() => this.client.incrby(key, increment));
  }

  async decr(key) {
    return this.enqueueCommand(() => this.client.decr(key));
  }

  async decrBy(key, decrement) {
    return this.enqueueCommand(() => this.client.decrby(key, decrement));
  }

  async expire(key, seconds) {
    return this.enqueueCommand(() => this.client.expire(key, seconds));
  }

  async ttl(key) {
    return this.enqueueCommand(() => this.client.ttl(key));
  }

  async lRange(key, start, stop) {
    return this.enqueueCommand(() => this.client.lrange(key, start, stop));
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      console.log('Redis 연결이 종료되었습니다.');
    }
  }
}

const redisServiceManager = new RedisServiceManager();
export default redisServiceManager;
