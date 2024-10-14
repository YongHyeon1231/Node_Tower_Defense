import { request } from './fetcher.js';
import { getLocalStorage } from './LocalStorage.js';
import { connect, requestGameEnd, requestGameStart } from './Socket.js';

const buttonContainer = document.querySelector('.button-container');

const createButton = (id, text) => {
  const loginButton = document.createElement('button');
  loginButton.id = id;
  loginButton.textContent = text;
  buttonContainer.appendChild(loginButton);
};

let token = getLocalStorage('token');

const initializeIndex = async () => {
  let isSigned = false;
  if (token) {
    const data = await request('/validToken', {}, 'POST', token);
    isSigned = data !== null;
    if (!isSigned) {
      console.log(`토큰 만료 됨 새로 로그인 해야함.`);
    }
  }

  if (isSigned) {
    await connect();
    createButton('playButton', '게임 플레이');
    document.getElementById('playButton').addEventListener('click', () => {
      document.querySelector('.button-container').style.display = 'none';
      document.getElementById('gameCanvas').style.display = 'block';
      import('./game.js');
    });
  } else {
    createButton('registerButton', '회원가입');
    createButton('loginButton', '로그인');

    document.getElementById('registerButton').addEventListener('click', () => {
      window.location.href = 'register.html';
    });
    document.getElementById('loginButton').addEventListener('click', () => {
      window.location.href = 'login.html';
    });
  }
};

await initializeIndex();
let gameData = [];

export const setGameData = (data) => {
  gameData = data;
  console.log('인덱스에서 세팅된 게임 데이터 : ', gameData.towers[2].damage);
};

export const getGameData = () => {
  return gameData;
};
