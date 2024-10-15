import { monsterSpawnHandler } from './monster.handler.js';
import { buyTower } from './tower.handler.js';

const ping = async (user, payload) => {
  return {
    status: 'success',
    message: `Pong! ${payload.ping}`,
  };
};
const handlerMappings = {
  999: ping,
  21: monsterSpawnHandler,
  31: buyTower,
};

export default handlerMappings;
