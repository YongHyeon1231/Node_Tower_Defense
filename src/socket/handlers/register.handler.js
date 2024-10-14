import { CLIENT_VERSION } from '../..//constants.js';
import logger from '../../libs/logger.js';
import { handleDisconnect, handlerEvent, handleConnection } from './helper.js';
import env from '../../libs/env.js';
import jwt from 'jsonwebtoken';

const { JWT_SECRET } = env;

const registerHandler = async (io) => {
  io.on('connection', async (socket) => {
    try {
      const uuid = socket.handshake.query.uuid;
      const clientVersion = socket.handshake.query.clientVersion;
      let validConnection = true;
      if (!uuid) {
        socket.emit('required_uuid', { status: 'fail', message: 'uuid can not empty' });
        logger.info(`Invalid UUID[${uuid}]`);
        validConnection = false;
      }

      if (!CLIENT_VERSION.includes(clientVersion)) {
        socket.emit('version_mismatch', { status: 'fail', message: 'your version is invalid' });
        logger.info(`Invalid Client Version[${clientVersion}]`);
        validConnection = false;
      }

      const user = jwt.verify(uuid, JWT_SECRET);
      if (!user) {
        socket.emit('invalid_token', { status: 'fail', message: 'your token is invalid' });
        logger.info(`Invalid token[${uuid}]`);
        validConnection = false;
      }

      if (!validConnection) {
        socket.disconnect(true);
        return;
      }

      await handleConnection(socket, uuid);
      socket.on('event', (data) => {
        console.log({ ...data, user });
        handlerEvent(io, socket, { ...data, user });
      });
      socket.on('disconnect', (socket) => handleDisconnect(socket, uuid));
    } catch (error) {
      logger.error('registerHandler : ', error);
      socket.disconnect(true);
    }
  });
};

export default registerHandler;
