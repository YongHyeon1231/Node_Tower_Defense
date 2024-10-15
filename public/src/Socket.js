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

export const buyTower = (idx, towerId, x, y, towerLevel) => {
  const currentTime = Date.now();
  sendEvent(31, {idx, towerId, x, y, towerLevel, currentTime});
}

export const requestSpawnMonster = () => {
  sendEvent(21, {});
};

export const requestGameStart = () => {
  // const states = GameManager.getStates();
  // GameManager.setState(states.stage_request);
  sendEvent(2, {});
};

export const requestGameEnd = () => {
  // const states = GameManager.getStates();
  // GameManager.setState(states.game_over);
  sendEvent(3, {
    //currentStage: GameManager.getCurrentStage(),
    currentScore: Score.score,
    currentDistance: Distance.distance,
  });
};

export const requestNextStage = () => {
  // const states = GameManager.getStates();
  //  GameManager.setState(states.stage_request);
  sendEvent(11, {
    //   currentStage: GameManager.getCurrentStage(),
    currentScore: Score.score,
  });
};
