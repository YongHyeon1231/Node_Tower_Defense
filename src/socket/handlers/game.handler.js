import prisma from "../../managers/prisma.manager.js";

// 게임 시작 이벤트 처리
export const gameStart = async (user, payload) => {
  const { playerId, currentStageId } = payload; // payload에서 데이터 추출
  const { id, email, name } = user; // 사용자 정보 추출

  try {
    // 플레이어 진행 상황 확인
    const existingProgress = await prisma.playerProgress.findFirst({
      where: { playerId },
    });

    if (existingProgress) {
      socket.emit('error', { message: '이미 게임이 진행 중입니다.' });
      return;
    }

    // 플레이어 진행 상황 생성
    const playerProgress = await prisma.playerProgress.create({
      payload: { // payload를 data로 변경
        playerId,
        currentStageId,
        gold: 0, // 초기 골드
        score: 0, // 초기 점수
        lastUpdate: new Date(),
      },
    });

    socket.emit('gameStarted', { message: '게임이 시작되었습니다.', playerProgress });
  } catch (error) {
    console.error('게임 시작 중 오류:', error);
    socket.emit('error', { message: '게임 시작 오류가 발생했습니다.' });
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
