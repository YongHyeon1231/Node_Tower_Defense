import ApiError from '../../errors/api-error.js';
import { getGameAssets } from '../../init/assets.js';
import logger from '../../libs/logger.js';
import gameRedis from '../../managers/redis.manager.js';

const selectMonsterByWeight = (availableMonsters) => {
  console.log('availableMonsters => ', availableMonsters);
  if (availableMonsters.length === 1) {
    return availableMonsters[0];
  }

  const totalWeight = availableMonsters.reduce((sum, monster) => sum + monster.weight, 0);
  const random = Math.random() * totalWeight;

  let accumulatedWeight = 0;
  for (let i = 0; i < availableMonsters.length; i++) {
    accumulatedWeight += availableMonsters[i].weight;
    if (random <= accumulatedWeight) {
      return availableMonsters[i];
    }
  }
};

// monster spawn handler
export const monsterSpawnHandler = async (user, payload) => {
  let message = undefined;
  let status = 'success';
  const event = 'monsterSpawn';
  let spawnMonsterId = undefined;
  try {
    const playerProgressKey = `playerProgress:${user.id}`;
    const playerMonsterStatusKey = `playerMonsterStatus:${user.id}`;

    const { monsters, stages, spartaHeadQuaters } = getGameAssets();

    const serverTime = Date.now();

    let currentStageId = 0;
    let [playerProgress, playerMonsterStatus] = await Promise.all([
      gameRedis.get(playerProgressKey),
      gameRedis.get(playerMonsterStatusKey),
    ]);

    const hq = spartaHeadQuaters.data[0];

    if (!playerProgress) {
      status = 'fail';
      message = 'go ahead and start';
    } else {
      currentStageId = playerProgress.currentStageId;

      const currentStage = stages.data.find((stage) => stage.id == currentStageId);
      // 1단계: 지금 스테이지에 소환되어 있는 몬스터 정보와 마지막으로 몬스터가 소환되었던 시간을 가지고와야한다.

      // 1-1단계: 몬스터 정보가 없음, 현재 몬스터 정보가 아예 없다면 새로 데이터를 생성해 줘야함 ms
      if (!playerMonsterStatus) {
        playerMonsterStatus = {
          monsters: [],
          lastSpawnTime: serverTime,
          lastUpdate: serverTime,
        };
      }

      const remainedTime = playerMonsterStatus.lastSpawnTime - serverTime;
      // 2단계: 현재 스테이지에서 소환이 더 가능한지랑 몬스터 스폰 시간 확인

      // 2-2단계: 이미 최대치로 소환함
      if (playerMonsterStatus.monsters.length + 1 > currentStage.monsterCount) {
        status = 'fail';
        message = `spawnCount reached maxMonsterCount : ${playerMonsterStatus.monsters.length}`;
      } else if (remainedTime > 0.0) {
        // 2-1단계: 현재 스폰 시간이 안됌
        status = 'fail';
        message = `remainedTime over zero : ${remainedTime}`;
      } else {
        // 3단계: 새롭게 소환할 몬스터에 대한 정보를 redis에 저장 그리고 그 시간을 또 저장
        const spawnMonster = selectMonsterByWeight(
          monsters.data.slice(0, currentStage.monsterTypeRange),
        );
        spawnMonsterId = spawnMonster.id;
        playerMonsterStatus.monsters.push(spawnMonster);
        playerMonsterStatus.lastSpawnTime = serverTime;
        playerMonsterStatus.lastUpdate = serverTime;

        await Promise.all([
          gameRedis.set(playerProgressKey, playerProgress),
          gameRedis.set(playerMonsterStatusKey, playerMonsterStatus),
        ]);
      }
    }
  } catch (error) {
    logger.error(`Error in monsterSpawnHandler: `, error);
    (status = 'fail'), (message = 'Server Internal Error');
    spawnMonsterId = undefined;
  } finally {
    // 4단계: 클라이언트한테 소환할 몬스터에 대한 정보를 보내주기
    return {
      event,
      status,
      message,
      spawnMonsterId,
    };
  }
};

export const monsterKillerHandler = async (user, payload) => {
  try {
    return {
      status: 'success',
      message: 'killed jeon jae hak',
      event: 'monsterKill',
    };
  } catch (error) {
    logger.error(`Error in monsterKillerHandler: ${error.message}`);
  }
};
