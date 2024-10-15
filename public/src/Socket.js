import { CLIENT_VERSION } from './Constants.js';
import handlers from './handlers/handlerMapping.js';
import { getLocalStorage } from './LocalStorage.js';
import { tokenVerify } from '../../src/rest/middleware/token.middleware.js';


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

export const requestSpawnMonster = () => {
  sendEvent(21, {});
};

export const requestGameStart = async () => {
  // 토큰 검증을 통해 req.user.id를 가져옴
  await tokenVerify({ headers: { authorization: `Bearer ${getLocalStorage('token')}` } }, {}, () => {});

  // 토큰에서 추출한 req.user.id를 바탕으로 playerId 구성
  const playerId = req.user && req.user.id; // tokenVerify를 통해 추출한 user id

  if (playerId) {
    const payload = {
      playerId, // 추출한 playerId 사용
    };

    // handlerId가 1인 이벤트로 게임 시작 요청 전송
    sendEvent(1, payload);
  } else {
    console.error('Player ID가 유효하지 않습니다.');
  }
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
