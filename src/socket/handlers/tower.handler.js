import ApiError from '../../errors/api-error.js';
import { getGameAssets } from '../../init/assets.js';
import logger from '../../libs/logger.js';
import gameRedis from '../../managers/redis.manager.js';

// tower spawn handler
export const buyTower = async (user, payload) => {
  try {
    let towerInfo = {
      towerId: payload.towerId,
      position: { x: payload.x, y: payload.y },
      level: 0,
      currentTime: payload.currentTime,
    };
    await gameRedis.hSet(
      `tower:${payload.towerIdx} : user:${user.id}`,
      'towerInfo',
      JSON.stringify(towerInfo),
    );
    console.log('타워구입이 서버에 전달 된건가?');
    return {
      event: 'buyTower', data : towerInfo
    };
  } catch (error) {
    logger.error(`Error in towerHandler: ${error.message}`);
    throw error;
  }
};
