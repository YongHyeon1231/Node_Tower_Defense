import { setMessage } from '../index.js';
export const stageSetup = (data) => {
  const stageId = data.stageId;
  // gameManager.setCurrentStage(stageId);
};

export const moveStage = (data) => {
  const stageId = data.stageId;
  // gameManager.setCurrentStage(stageId);
};

export const gameStartHandler = (data) => {
  if (data?.status === 'success') {
    import('../game.js');
  } else {
    setMessage('게임 시작에 실패했습니다.');
  }
};

export const gameEndHandler = (data) => {
  //새로고침해서 다시 다 불러오게 만듦
  location.reload();
};
