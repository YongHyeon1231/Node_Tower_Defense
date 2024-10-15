import { getGameAssets } from '../../init/assets.js';
import handlerMappings from './handlerMapping.js';
import logger from '../../libs/logger.js';

export const handleDisconnect = async (socket, user) => {
  logger.info(`User disconnected : `, user);
};

export const handleConnection = async (socket, user) => {
  logger.info(`New user connected : ${user.id} with socket ID: ${socket.id}`);
  const { monsters, spartaHeadQuaters, stages, towers } = getGameAssets();

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
    socket.emit('handler_not_found', {
      status: 'fail',
      message: `Handler not found[${data?.handlerId}]`,
    });
    return;
  }

  const response = await handler(data.user, data.payload);
  if (!response) {
    logger.error(`Handler[${handler}]에서 결과 반환 안함 : ${response}`);
    return;
  }
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
