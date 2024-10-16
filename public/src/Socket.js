import { CLIENT_VERSION } from './Constants.js';
import handlers from './handlers/handlerMapping.js';
import { getLocalStorage } from './LocalStorage.js';
let socket = null;

const socketProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const socketUrl = `${socketProtocol}//${window.location.host}/`;

export const connect = () => {
  socket = io(socketUrl, {
    query: {
      clientVersion: CLIENT_VERSION,
      uuid: getLocalStorage('token'),
    },
  });

  handlers.forEach((handler) => {
    socket.on(handler.event, (data) => {
      console.log(`rcv : ${handler.event} => ${JSON.stringify(data)}`);
      handler.action(data);
    });
  });
};

export const sendEvent = (handlerId, payload) => {
  socket.emit('event', {
    //   userId: GameManager.getUUID(),
    handlerId,
    payload,
  });
};

export const requestBuyTower = (data) => {
  let currentTime = Date.now();
  sendEvent(31, { data, currentTime });
};

export const requestSellTower = (data) => {
  let currentTime = Date.now();
  sendEvent(32, { data, currentTime });
};

export const requestUpgradeTower = (data) => {
  let currentTime = Date.now();
  sendEvent(33, { data, currentTime });
};

export const requestKillMonster = (monsterUUID) => {
  sendEvent(22, { monsterUUID });
};

export const requestSpawnMonster = () => {
  sendEvent(21, {});
};

export const requestGameStart = async () => {
  sendEvent(1, {});
};

export const requestGameEnd = () => {
  sendEvent(9, {});
};

export const requestNextStage = () => {
  sendEvent(2, {});
};
