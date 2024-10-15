export const stageSetup = (data) => {
  const stageId = data.stageId;
  // gameManager.setCurrentStage(stageId);
};

export const moveStage = (data) => {
  const stageId = data.stageId;
  // gameManager.setCurrentStage(stageId);
};

export const updatedRank = (data) => {
  // gameManager.setRankUser({
  //   highScore: data.firsUser.highScore,
  //   highDistance: data.firsUser.highDistance,
  // });
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