import { CLIENT_VERSION } from '../..//constants.js';
import logger from '../../libs/logger.js';
import { handleDisconnect, handlerEvent, handleConnection } from './helper.js';
import { v4 } from 'uuid';

const registerHandler = async (io) => {
  io.on('connection', async (socket) => {
    if (!CLIENT_VERSION.includes(socket.handshake.query.clientVersion)) {
      socket.disconnect(true);
      return;
    }
    let uuid = socket.handshake.query.uuid;
    if (!uuid) {
      uuid = v4();
    }

    await handleConnection(socket, uuid);
    socket.on('event', (data) => handlerEvent(io, socket, data));
    socket.on('disconnect', (socket) => handleDisconnect(socket, uuid));
  });
};

export default registerHandler;
