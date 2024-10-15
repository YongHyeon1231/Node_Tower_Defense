import { monsterSpawnHandler } from './monster.handler.js';
import { gameStart, gameEnd } from './game.handler.js';

import { moveStageHandler } from './stage.handler.js';

const ping = async (user, payload) => {
  return {
    status: 'success',
    message: `Pong! ${payload.ping}`,
  };
};
const handlerMappings = {
  999: ping,
  21: monsterSpawnHandler,
  1: gameStart,
  9: gameEnd,
  2: moveStageHandler,
};

export default handlerMappings;
