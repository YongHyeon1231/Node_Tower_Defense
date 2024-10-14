import { getCurrentStage, getPrevStage, setPrevStage } from '../game.js';
import { requestNextStage, requestSpawnMonster } from '../Socket.js';

// 현재 스폰 시간이 안되었다. => 서버에서 아직 남은시간 보내 준후 timeout을 통해 기다렸다가 다시 던져주기
export const spawnTimeNotYetHandler = (data) => {
  const remainedTime = data.remainedTime;

  setTimeout(() => {
    requestSpawnMonster();
  }, remainedTime);
};

// 이미 최대치로 소환했다. => stage가 바뀌기 전까지 대기
export const alreadyMaxSpawnHandler = (data) => {
  const stageChangeInterval = data.stageChangeInterval || 5000;

  // 스테이지 변경 여부를 주기적으로 확인하기 위해 setInterval 사용
  const stageCheckInterval = setInterval(() => {
    // 스테이지 변경 여부 확인
    if (isStageChanged()) {
      clearInterval(stageChangeInterval);
      setPrevStage(getCurrentStage());
      requestSpawnMonster();
    }
  }, stageChangeInterval);
};

// 다음 스테이지가 시작되어 소환해도 된다.
export const monsterSpawnHandler = (data) => {
  if (isStageChanged) {
    requestSpawnMonster();
  }
};

const isStageChanged = () => {
  const currentStage = getCurrentStage();
  const prevStage = getPrevStage();

  return currentStage > prevStage ? true : false;
};
