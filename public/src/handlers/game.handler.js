import { setMessage } from '../index.js';
export const stageSetup = (data) => {
  const stageId = data.stageId;
  // gameManager.setCurrentStage(stageId);
};

export const moveStage = (data) => {
  const stageId = data.stageId;
  // gameManager.setCurrentStage(stageId);
};

export const gameStartHandler = async (data) => {
  if (data?.status === 'success') {
    const game = await import('../game.js');
    game.initGame(data.gold, data.highScore, data.stageId);
  } else {
    setMessage('게임 시작에 실패했습니다.');
  }
};

export const gameEndHandler = (data) => {
  //새로고침해서 다시 다 불러오게 만듦
  location.reload();
};

export const buyTower = (data) =>{
  console.log("구매데이터가 여기까지 온다고?", data);
};
export const sellTower = (data) =>{
  console.log("판매데이터가 여기까지 온다고?", data);
};
export const upgradeTower = (data) =>{
  console.log("업그레이드데이터가 여기까지 온다고?", data);
};