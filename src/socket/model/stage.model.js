import redisServiceManager from '../../managers/redis.manager.js';

const STAGE_ID_KEY = 'stage_id';

export const stageModel = {
  // 유저의 스테이지를 Redis에 추가
  addStageId: async (uuid, stageId) => {
    console.log('ZADD => ', JSON.stringify(uuid), stageId);
    await redisServiceManager.zAdd(STAGE_ID_KEY, { stageId, value: JSON.stringify(uuid) });
  },

  // 해당 유저의 모든 스테이지를 Redis에서 가져오기
  getStage: async (uuid) => {
    const stages = await redisServiceManager.zRange(
      `${STAGE_ID_KEY}:${uuid}`,
      0,
      -1, // 모든 스테이지를 오름차순으로 가져옴
      { withScores: false }, // stage ID 값만 필요
    );
    return stages.map(Number); // stage ID를 숫자로 변환하여 반환
  },

  // 유저의 현재 스테이지와 타임스탬프 업데이트
  setStage: async (uuid, stageId, timestamp) => {
    console.log('스테이지 업데이트:', stageId, '타임스탬프:', timestamp);
    await redisServiceManager.hSet(
      `${STAGE_ID_KEY}:${uuid}:current`, // 현재 스테이지 저장을 위한 키
      { stageId, timestamp: timestamp.toString() },
    );
  },

  // 유저의 현재 스테이지와 타임스탬프 가져오기
  getCurrentStage: async (uuid) => {
    const data = await redisServiceManager.hGetAll(`${STAGE_ID_KEY}:${uuid}:current`);
    return {
      stageId: Number(data.stageId),
      timestamp: Number(data.timestamp),
    };
  },
};
