import { getGameAssets } from '../../init/assets.js';
import handlerMappings from './handlerMapping.js';
import logger from '../../libs/logger.js';

export const handleDisconnect = async (socket, uuid) => {
  logger.info(`User disconnected : ${uuid}`);
};

export const handleConnection = async (socket, uuid) => {
  logger.info(`New user connected : ${uuid} with socket ID: ${socket.id}`);
  const { stages, items, itemUnlocks } = getGameAssets();

  socket.emit('connection', {
    uuid,
    stages: stages.data,
    items: items.data,
    itemUnlocks: itemUnlocks.data,
  });
};

export const handlerEvent = async (io, socket, data) => {
  const handler = handlerMappings[data.handlerId];
  if (!handler) {
    socket.emit('response', { status: 'fail', message: 'Handler not found' });
    return;
  }

  const response = await handler(data.userId, data.payload);

  const broadcast = response.broadcast;
  response.broadcast = undefined;

  const event = response.event || 'response';
  response.event = undefined;

  io.emit(broadcast.event, broadcast.data);
  socket.emit(event, response);
  //핸들링 결과 로그 출력
  logger.info(`handler. br[${broadcast}] ${event} - ${JSON.stringify(response)}`);
};
