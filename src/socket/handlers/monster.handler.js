import ApiError from '../../errors/api-error.js';
import { getGameAssets } from '../../init/assets.js';
import logger from '../../libs/logger.js';
import { gameRedis } from '../../managers/redis.manager.js';

// monster spawn handler
export const monsterSpawnHandler = async (user, payload) => {
  try {
    const stageId = await gameRedis.hGet(`user:${user.id}`, 'stage');

    // 1단계: 지금 스테이지에 소환되어 있는 몬스터 정보와 마지막으로 몬스터가 소환되었던 시간을 가지고와야한다.
    const monsterInfo = await gameRedis.hGet(`user:${user.id}:stage:${stageId}`, 'monsterInfo');
    // 1-1단계: 몬스터 정보가 없음, 현재 몬스터 정보가 아예 없다면 새로 데이터를 생성해 줘야함 ms
    if (!monsterInfo) {
      monsterInfo = {
        monsterCount: getGameAssets('monsters')[0].monsterCount, // 최대 몬스터 소환 수
        spawnCount: 0, // 소환된 수
        lastSpawnTime: Date.now(), // 마지막 소환 시간
      };
      // Redis에 초기 몬스터 정보를 저장
      await gameRedis.hSet(`user:${user.id}:stage${stageId}`, JSON.stringify(monsterInfo));
    } else {
      monsterInfo = JSON.parse(monsterInfo);
    }

    const serverTime = Date.now();
    const remainedTime = serverTime - monsterInfo.lastSpawnTime;
    // 2단계: 현재 스테이지에서 소환이 더 가능한지랑 몬스터 스폰 시간 확인
    // 2-1단계: 현재 스폰 시간이 안됌
    if (remainedTime < 1000) {
      return {
        event: 'spawnTimeNotYetHandler',
        remainedTime,
      };
    }

    // 2-2단계: 이미 최대치로 소환함
    if (monsterInfo.spawnCount >= monsterInfo.monsterCount) {
      return {
        event: 'alreadyMaxSpawnHandler',
      };
    }

    // 3단계: 새롭게 소환할 몬스터에 대한 정보를 redis에 저장 그리고 그 시간을 또 저장
    const monsterData = getGameAssets('monsters');

    monsterInfo.spawnCount += 1;
    monsterInfo.lastSpawnTime = serverTime;
    await gameRedis.hSet(
      `user:${user.id}:stage:${stageId}`,
      'monsterInfo',
      JSON.stringify(monsterInfo),
    );

    // 4단계: 클라이언트한테 소환할 몬스터에 대한 정보를 보내주기
    return {
      event: 'requestSpawnMonster',
    };
  } catch (error) {
    logger.error(`Error in monsterSpawnHandler: ${error.message}`);
    throw error;
  }
};
