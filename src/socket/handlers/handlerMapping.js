import { monsterSpawnHandler, monsterKillerHandler } from './monster.handler.js';

const ping = async (user, payload) => {
  return {
    status: 'success',
    message: `Pong! ${payload.ping}`,
  };
};
const handlerMappings = {
  999: ping,
  21: monsterSpawnHandler,
  22: monsterKillerHandler,
};

export default handlerMappings;
