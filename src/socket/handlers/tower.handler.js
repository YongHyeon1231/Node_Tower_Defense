import ApiError from '../../errors/api-error.js';
import { getGameAssets } from '../../init/assets.js';
import logger from '../../libs/logger.js';
import gameRedis from '../../managers/redis.manager.js';

// tower spawn handler
export const buyTower = async (user, payload) => {
  try {
    let towerInfo = {
      towerIdx: payload.data.towerIdx,
      position: { x: payload.data.x, y: payload.data.y },
      level: 0,
      currentTime: payload.currentTime,
    };
    await gameRedis.hSet(
      `tower:${payload.towerUUID} : user:${user.id}`,
      'towerInfo',
      JSON.stringify(towerInfo),
    );
    console.log('타워구입이 서버에 전달 된건가?', payload, '\n');
    console.log('이건 타워의 UUID야', payload.data.towerUUID);
    return {
      event: 'buyTower',
      data: towerInfo,
    };
  } catch (error) {
    logger.error(`Error in buyTowerHandler: ${error.message}`);
    throw error;
  }
};

export const sellTower = async (user, payload) => {
  try {
    await gameRedis.invalidate(
      `tower:${payload.towerUUID} : user:${user.id}`,
    );
    console.log("타워를 팔아보자", payload, "\n");
    console.log('이건 판매한 타워의 UUID야', payload.data.towerUUID);
    return {
      event: 'sellTower',
    };
  } catch (error) {
    logger.error(`Error in sellTowerHandler: ${error.message}`);
    throw error;
  }
};

export const upgradeTower = async (user, payload) => {
  try {
    let towerInfo = {
      towerId: payload.data.towerId,
      position: { x: payload.data.x, y: payload.data.y },
      level: payload.level,
      currentTime: payload.currentTime,
    };
    await gameRedis.hSet(
      `tower:${payload.towerIdx} : user:${user.id}`,
      'towerInfo',
      JSON.stringify(towerInfo),
    );
    console.log('타워업그레이드를 해봤어요!', payload, '\n');
    console.log('이건 업그레이드 한 타워의 UUID야', payload.data.towerUUID);
    return {
      event: 'upgradeTower',
      data: towerInfo,
    };
  } catch (error) {
    logger.error(`Error in upgradeTowerHandler: ${error.message}`);
    throw error;
  }
};
