import { getGameAssets } from '../../init/assets.js';
import handlerMappings from './handlerMapping.js';
import logger from '../../libs/logger.js';
import redisServiceManager from '../../managers/redis.manager.js';

export const handleDisconnect = async (socket, user) => {
  await removeUserData(user);
  logger.info(`User disconnected : `, user.id);
};

export const handleConnection = async (socket, user) => {
  logger.info(`New user connected : ${user.id} with socket ID: ${socket.id}`);
  const { monsters, spartaHeadQuaters, stages, towers } = getGameAssets();
  await removeUserData(user);
  socket.emit('connection', {
    monsters: monsters.data,
    spartaHeadQuaters: spartaHeadQuaters.data,
    stages: stages.data,
    towers: towers.data,
  });
};

export const handlerEvent = async (io, socket, data) => {
  const handler = handlerMappings[data.handlerId];
  if (!handler) {
    socket.emit('response', {
      status: 'handler_not_found',
      message: `Handler not found[${data?.handlerId}]`,
    });
    return;
  }

  const response = await handler(data.user, data.payload);

  const broadcast = response.broadcast;
  response.broadcast = undefined;

  const event = response.event || 'response';
  response.event = undefined;

  if (broadcast) {
    io.emit(broadcast.event, broadcast.data);
  }
  socket.emit(event, response);
  //핸들링 결과 로그 출력
  logger.info(`handler. br[${broadcast}] ${event} - ${JSON.stringify(response)}`);
};

/**
 *  레디스에서 유저 정보 다 제거해야함
 */
export const removeUserData = async (user) => {
  const { id, email, name } = user;

  let keys = [];
  keys.push(`playerProgress:${id}`);
  keys.push(`playerMonsterStatus:${id}`);
  const result = await redisServiceManager.unlink(keys);
};
