import { monsterSpawnHandler } from './monster.handler.js';
import { buyTower, sellTower, upgradeTower } from './tower.handler.js';

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
  32: sellTower,
  33: upgradeTower,
};

export default handlerMappings;
