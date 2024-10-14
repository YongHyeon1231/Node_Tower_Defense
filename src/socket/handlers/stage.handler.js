import { getStage, setStage } from '../../models/stage.model.js';
import { getGameAssets } from '../../init/assets.js';

export const moveStageHandler = (uuid, payload) => {
  console.log('스테이지 이동 요청');
  let currentStages = getStage(uuid); // 서버가 가지고 있는 유저의 현재 스테이지 정보
  if (!currentStages.length) {
    return { status: 'fail', message: 'No stages found for user' };
  }

  // 오름차순 정렬 후 -> 가장 큰 스테이지 ID 확인 = 유저의 현재 스테이지
  currentStages.sort((a, b) => a.id - b.id);
  const currentStage = currentStages[currentStages.length - 1];

  // 클라이언트 vs 서버 비교
  if (currentStage.id !== payload.currentStage) {
    return { status: 'fail', message: 'Current stage mismatch' };
  }
  // targetStage 대한 검증 <- 게임 에셋에 존재하는가?
  const { stages } = getGameAssets();

  if (!stages.data.some((stage) => stage.id === payload.targetStage)) {
    return { status: 'fail', message: `Target stage (${payload.targetStage}) not found` };
  }

  const serverTime = Date.now(); //  현재 타임스탬프

  // 유저의 다음 스테이지 정보 업데이트 + 현재 시간
  setStage(uuid, payload.targetStage, serverTime);
  return {
    status: 'success',
    message: '스테이지 변동 성공!',
    event: 'moveStage',
    stage: payload.targetStage,
  };
};
