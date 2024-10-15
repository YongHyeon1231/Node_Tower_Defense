import { request } from './fetcher.js';
import { getLocalStorage, setLocalStorage } from './LocalStorage.js';
import { connect, requestGameEnd, requestGameStart } from './Socket.js';

const buttonContainer = document.querySelector('.button-container');

const createButton = (id, text) => {
  let button = document.getElementById(id);
  let created = false;
  if (!button) {
    button = document.createElement('button');
    buttonContainer.appendChild(button);
    created = true;
  }

  button.id = id;
  button.textContent = text;

  return created;
};

let token = getLocalStorage('token');

export const setMessage = (text) => {
  const messageElement = document.querySelector('.message');
  messageElement.textContent = text;
};

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
    setMessage('로그인 시도중 입니다.');
    await connect();
  } else {
    setMessage('로그인 하거나 회원가입 해주세요.');
    if (createButton('registerButton', '회원가입')) {
      document.getElementById('registerButton').addEventListener('click', () => {
        window.location.href = 'register.html';
      });
    }

    if (createButton('loginButton', '로그인')) {
      document.getElementById('loginButton').addEventListener('click', () => {
        window.location.href = 'login.html';
      });
    }
  }
};

await initializeIndex();
let gameData = [];

export const setGameData = (data) => {
  gameData = data;
  console.log('인덱스에서 세팅된 게임 데이터 : ', gameData.towers[2].damage);

  setMessage('원하는 메뉴를 선택해주세요.');
  if (createButton('playButton', '게임 플레이')) {
    document.getElementById('playButton').addEventListener('click', () => {
      document.querySelector('.button-container').style.display = 'none';
      document.getElementById('gameCanvas').style.display = 'block';
      requestGameStart();
    });
  }

  if (createButton('signOut', '로그아웃')) {
    document.getElementById('signOut').addEventListener('click', () => {
      setLocalStorage('token', null);
      location.reload();
    });
  }
};

export const getGameData = () => {
  return gameData;
};
