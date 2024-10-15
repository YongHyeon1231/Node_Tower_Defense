import { getGameAssets } from '../../init/assets.js';
import logger from '../../libs/logger.js';
import prisma from '../../managers/prisma.manager.js';
import redis from '../../managers/redis.manager.js';

// 게임 시작 이벤트 처리
export const gameStart = async (user, payload) => {
  const { id, email, name } = user; // 사용자 정보 추출
  let message = undefined;
  let event = 'game_start';
  let status = 'success';
  let result = {};
  const playerProgressKey = `playerProgress:${id}`;
  try {
    // 플레이어 진행 상황 확인

    const [player, existingProgress] = await Promise.all([
      prisma.player.findUnique({ where: { id } }),
      redis.exists(playerProgressKey),
    ]);

    if (existingProgress) {
      message = 'Already progress game';
      status = 'fail';
    } else {
      const { spartaHeadQuaters, stages } = getGameAssets();
      const HQ = spartaHeadQuaters.data[0];
      await redis.set(playerProgressKey, {
        currentStageId: stages.data[0].id,
        currentHQId: HQ.id,
        currentHQHp: HQ.maxHP,
        gold: 0,
        score: 0,
        lastUpdate: new Date(),
      });
    }
    result.gold = 0;
    result.score = 0;
    result.highScore = player.highScore;

    // 플레이어 진행 상황 생성
  } catch (error) {
    logger.error('게임 시작 중 오류:', error);
    status = 'fail';
    result = undefined;
  } finally {
    return {
      event,
      message,
      status,
      ...result,
    };
  }
};

// 게임 종료 이벤트 처리
export const gameEnd = async (user, payload) => {
  const { id, email, name } = user; // 사용자 정보 추출
  let message = undefined;
  let event = 'game_end';
  let status = 'success';
  const playerProgressKey = `playerProgress:${id}`;

  try {
    const [player, playerProgress] = await Promise.all([
      prisma.player.findUnique({ where: { id } }),
      redis.exists(playerProgressKey),
    ]);

    if (playerProgress) {
      if (player.highScore < playerProgress.score) {
        await prisma.player.update({ where: { id }, data: { highScore: playerProgress.score } });
        message = 'new highScore';
      } else {
        message = 'successfully game ended';
      }
    } else {
      message = 'could not found player progress';
      status = 'fail';
    }
  } catch (error) {
    logger.error('게임 종료 중 오류:', error);
    status = 'fail';
    message = 'failed game end';
  } finally {
    return {
      event,
      message,
      status,
    };
  }
};
