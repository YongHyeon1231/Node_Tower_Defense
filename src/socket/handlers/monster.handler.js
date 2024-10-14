import ApiError from '../../errors/api-error.js';
import { getGameAssets } from '../../init/assets.js';
import logger from '../../libs/logger.js';
import { gameRedis } from '../../managers/redis.manager.js';

// monster spawn handler
export const monsterSpawnHandler = async (user, payload) => {
  const { stageId, timestamp } = payload;
  try {
    // 스테이지 정보를 가져옴
    const stageInfo = await gameRedis.hGet(`user:${user.uuid}:stageId:${stageId}`, 'stageId');
    if (!stageInfo) {
      logger.error(`Stage ${stageId} not found.`);
      throw new ApiError('해당 유저의 스테이지 정보를 가져오지 못함', 401);
    }

    // 몬스터 스폰 시간 확인
    const monsterInfo = await gameRedis.hGet(
      `user:${user.uuid}:monsterData:${monsterData}`,
      'monsterData',
    );

    if (monsterInfo) {
      const { spawnTime } = JSON.parse(monsterInfo);
      const currentTime = timestamp || Date.now();

      // 몬스터가 스폰된 지 1초가 지났는지 체크
      if (currentTime - spawnTime < 1000) {
        logger.info('몬스터가 생성된 지 1초가 지나지 않았습니다.');
        throw new ApiError('몬스터가 생성된 지 1초가 지나지 않았습니다', 401);
      }
    }

    // 몬스터 스폰 로직
    const monsterData = getGameAssets('monsters');
    const spawnTime = timestamp || Date.now();
    await gameRedis.hSet(
      `user:${user.uuid}:stage:${stageId}:monsterData`,
      'monsterData',
      JSON.stringify({
        monster: monsterData,
        spawnTime: spawnTime,
      }),
    );
    console.log(`새로운 몬스터가 스테이지 ${stageId}에 스폰되었습니다.`);
    logger.info(`새로운 몬스터가 스테이지 ${stageId}에 스폰되었습니다.`);

    return {
      monster: monsterData,
      stageId,
      spawnTime,
    };
  } catch (error) {
    logger.error(`Error in monsterSpawnHandler: ${error.message}`);
    throw error;
  }
};
