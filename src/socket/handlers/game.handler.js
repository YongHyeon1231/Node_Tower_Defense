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
    const existingProgress = await redis.exists(playerProgressKey);

    console.log(`existingProgress: ${existingProgress}`);
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
  const { id, email, name } = user;
  const { playerId, score, gold } = payload; // payload에서 playerId, score, gold 가져오기

  try {
    // 플레이어 진행 상황 검색
    const playerProgress = await prisma.playerProgress.findFirst({
      where: { playerId },
    });

    if (!playerProgress) {
      return socket.emit('error', { message: '플레이어 진행 상황을 찾을 수 없습니다.' });
    }

    // 플레이어 진행 상황 업데이트
    const updatedProgress = await prisma.playerProgress.update({
      where: { id: playerProgress.id },
      payload: {
        score: playerProgress.score + score,
        gold: playerProgress.gold + gold,
        lastUpdate: new Date(),
      },
    });

    socket.emit('gameEnded', { message: '게임이 종료되었습니다.', updatedProgress });
  } catch (error) {
    console.error('게임 종료 중 오류:', error);
    socket.emit('error', { message: '게임 종료 오류가 발생했습니다.' });
  }
};
