import { Server as SocketIO } from 'socket.io';
import registerHandler from '../socket/handlers/register.handler.js';
import env from '../libs/env.js';
import logger from '../libs/logger.js';
const { SERVER_HOST, SERVER_PORT } = env;

const initSocket = async (server) => {
  const origin = `http://${SERVER_HOST}:${SERVER_PORT}`;
  const io = new SocketIO(server, {
    cors: {
      origin,
    },
  });

  logger.info(`Socket server initialized : ${origin}`);
  await registerHandler(io);
};

export default initSocket;
