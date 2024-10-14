import { setLocalStorage, getLocalStorage } from '../LocalStorage.js';
import { setGameData } from '../index.js';

export const connectHandler = (data) => {
  console.log(`서버와 연결됨 : \n`, data);
  setGameData(data);
};

export const disconnectHandler = (data) => {
  console.log('서버와 연결 끊김 : \n', data);
  location.reload();
};

export const versionMismatchHandler = (data) => {
  console.error('버전이 맞지 않음 : ', data);
};

export const requiredUUIDHandler = (data) => {
  console.error('UUID가 없다 함 : ', data);
};

export const invalidTokenHandler = (data) => {
  console.error('토큰 인증 실패함 : ', data);
};

export const handlerNotFoundHandler = (data) => {
  console.error('요청한 이벤트는 존재하지 않음 : ', data);
};
