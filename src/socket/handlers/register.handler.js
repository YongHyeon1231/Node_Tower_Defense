import { CLIENT_VERSION } from '../..//constants.js';
import logger from '../../libs/logger.js';
import { handleDisconnect, handlerEvent, handleConnection } from './helper.js';

const registerHandler = async (io) => {
  io.on('connection', async (socket) => {
    const uuid = socket.handshake.query.uuid;
    const clientVersion = socket.handshake.query.clientVersion;
    if (!uuid || !CLIENT_VERSION.includes(clientVersion)) {
      logger.info(`Invalid UUID[${uuid}] or Client version : ${clientVersion}`);
      socket.disconnect(true);
      return;
    }

    await handleConnection(socket, uuid);
    socket.on('event', (data) => handlerEvent(io, socket, data));
    socket.on('disconnect', (socket) => handleDisconnect(socket, uuid));
  });
};

export default registerHandler;
