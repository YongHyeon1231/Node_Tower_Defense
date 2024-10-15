import { getGameAssets } from '../../init/assets.js';
import logger from '../../libs/logger.js';
import redis from '../../managers/redis.manager.js';

export const moveStageHandler = async (user, payload) => {
  const { id, email, name } = user;
  let message = undefined;
  let event = 'move_stage';
  let status = 'success';
  let result = undefined;
  const playerProgressKey = `playerProgress:${id}`;
  const playerMonsterStatusKey = `playerMonsterStatus:${user.id}`;
  try {
    let playerProgress = await redis.get(playerProgressKey);
    console.log(playerProgressKey, ' => ', playerProgress);
    if (playerProgress) {
      const { stages } = getGameAssets();
      let currentStageId = playerProgress.currentStageId;
      let currentStageIndex = stages.data.findIndex((stage) => stage.id == currentStageId);

      if (currentStageIndex === -1) {
        status = 'fail';
        message = `could not found stage : ${currentStageId}`;
      } else if (stages.data.length <= currentStageIndex + 1) {
        status = 'fail';
        message = `reach final stage : ${currentStageIndex}`;
      } else {
        currentStageIndex++;
        result = {
          nextStage: stages.data[currentStageIndex].id,
        };
        playerProgress.currentStageId = result.nextStage;
        playerProgress.lastUpdate = Date.now();
        await Promise.all([
          redis.set(playerProgressKey, playerProgress),
          redis.unlink(playerMonsterStatusKey),
        ]);
      }
    } else {
      status = 'fail';
      message = 'go ahead and start';
    }
  } catch (error) {
    result = undefined;
    status = 'fail';
    message = 'fail move stage';
    logger.error(`moveStageHandler. error stage move : `, error);
  }

  return {
    status,
    message,
    event,
    ...result,
  };
};
