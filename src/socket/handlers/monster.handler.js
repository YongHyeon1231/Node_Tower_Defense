import ApiError from '../../errors/api-error.js';
import { getGameAssets } from '../../init/assets.js';
import logger from '../../libs/logger.js';
import gameRedis from '../../managers/redis.manager.js';
import { v4 } from 'uuid';

const selectMonsterByWeight = (availableMonsters) => {
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
  let result = undefined;
  try {
    const playerProgressKey = `playerProgress:${user.id}`;
    const playerMonsterStatusKey = `playerMonsterStatus:${user.id}`;

    const { monsters, stages } = getGameAssets();

    const serverTime = Date.now();

    let currentStageId = 0;
    let [playerProgress, playerMonsterStatus] = await Promise.all([
      gameRedis.get(playerProgressKey),
      gameRedis.get(playerMonsterStatusKey),
    ]);

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
          monsters: { length: 0 },
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

        const spawnMonsterId = spawnMonster.id;
        const monsterUUID = v4();
        result = {
          monsterUUID,
          spawnMonsterId,
        };
        playerMonsterStatus.monsters[monsterUUID] = {
          id: spawnMonster.id,
          maxHp: spawnMonster.hp,
          hp: spawnMonster.hp,
        };
        playerMonsterStatus.monsters.length++;
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
    result = undefined;
  } finally {
    // 4단계: 클라이언트한테 소환할 몬스터에 대한 정보를 보내주기
    return {
      event,
      status,
      message,
      ...result,
    };
  }
};

export const monsterKillerHandler = async (user, payload) => {
  let message = undefined;
  let status = 'success';
  const event = 'monsterKill';
  let result = undefined;
  try {
    const { monsterUUID } = payload;

    if (!monsterUUID) {
      message = 'monsterUUID can not empty';
      status = 'fail';
      throw new Error(message);
    }
    const playerProgressKey = `playerProgress:${user.id}`;
    const playerMonsterStatusKey = `playerMonsterStatus:${user.id}`;

    const { monsters, stages } = getGameAssets();

    const serverTime = Date.now();

    let [playerProgress, playerMonsterStatus] = await Promise.all([
      gameRedis.get(playerProgressKey),
      gameRedis.get(playerMonsterStatusKey),
    ]);

    if (!playerProgress || !playerMonsterStatus) {
      status = 'fail';
      message = 'go ahead and start';
    } else {
      const currentStageId = playerProgress.currentStageId;
      const currentStageIndex = stages.data.findIndex((stage) => stage.id == currentStageId);
      const targetMonsterId = playerMonsterStatus.monsters[monsterUUID].id;
      const targetMonsterInfo = monsters.data.find((monster) => monster.id == targetMonsterId);

      playerMonsterStatus.monsters[monsterUUID] = undefined;
      playerMonsterStatus.monsters.length--;
      playerMonsterStatus.lastUpdate = serverTime;
      playerProgress.gold += targetMonsterInfo.gold;
      playerProgress.score += targetMonsterInfo.scorePerStage * (currentStageIndex + 1);
      result = {
        gold: playerProgress.gold,
        score: playerProgress.score,
        monsterLevel: Math.floor(playerProgress.score / 100) + 1,
        monsterUUID,
      };
      await Promise.all([
        gameRedis.set(playerProgressKey, playerProgress),
        gameRedis.set(playerMonsterStatusKey, playerMonsterStatus),
      ]);
    }
  } catch (error) {
    if (!message) {
      message = 'Server Internal Error';
    }
    status = 'fail';
    logger.error(`Error in monsterKillerHandler: `, error);
  }

  return {
    status,
    message,
    event,
    ...result,
  };
};
