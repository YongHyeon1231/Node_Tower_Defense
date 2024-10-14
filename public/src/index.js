import { connect, requestGameEnd, requestGameStart } from './Socket.js';

let gameData = [];

export const setGameData = (data) => {
  gameData = data;
  console.log("인덱스에서 세팅된 게임 데이터 : ",gameData.towers)
};

export const getGameData = () => {
  return gameData; 
};

// 연결 함수 호출 및 콜백 전달
await connect();