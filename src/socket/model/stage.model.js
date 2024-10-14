import redisServiceManager from '../../managers/redis.manager.js';

const STAGE_ID_KEY = 'stage_id';

export const stageModel = {
  addStageId: async (uuid, stageId) => {
    console.log('ZADD => ', JSON.stringify(uuid), stageId);
    await redisServiceManager.zAdd(STAGE_ID_KEY, { stageId, value: JSON.stringify(uuid) });
  },
};
