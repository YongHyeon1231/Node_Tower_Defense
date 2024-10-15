import { stageModel } from './../model/stage.model.js';
import { getGameAssets } from '../../init/assets.js';

export const moveStageHandler = async (uuid, payload) => {
  console.log('스테이지 이동 요청');
  // Redis에서 유저의 현재 스테이지 정보 가져오기
  let currentStages = await stageModel.getStage(uuid); // 서버가 가지고 있는 유저의 현재 스테이지 정보
  if (!currentStages.length) {
    return { status: 'fail', message: 'No stages found for user' };
  }

  // 오름차순 정렬 후 -> 가장 큰 스테이지 ID 확인 = 유저의 현재 스테이지
  const latestStage = Math.max(...currentStages);

  // 클라이언트 vs 서버 비교
  if (latestStage !== payload.currentStage) {
    return { status: 'fail', message: 'Current stage mismatch' };
  }
  // targetStage 대한 검증 <- 게임 에셋에 존재하는가?
  const { stages } = getGameAssets();

  if (!stages.data.some((stage) => stage.id === payload.targetStage)) {
    return { status: 'fail', message: `Target stage (${payload.targetStage}) not found` };
  }

  const serverTime = Date.now(); //  현재 타임스탬프

  // Redis에 새로운 스테이지와 타임스탬프 저장
  await stageModel.addStageId(uuid, payload.targetStage); // 새로운 스테이지 추가
  await stageModel.setStage(uuid, payload.targetStage, serverTime); // 현재 스테이지와 타임스탬프 업데이트
  return {
    status: 'success',
    message: '스테이지 변동 성공!',
    event: 'moveStage',
    stage: payload.targetStage,
  };
};
