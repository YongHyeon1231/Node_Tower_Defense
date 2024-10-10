import express from 'express';
import { createServer } from 'http';
import initSocket from './init/socket.js';
import { loadGameAssets } from './init/assets.js';
import redisServiceManager from './managers/redis.manager.js';
import env from './libs/env.js';
import helmet from 'helmet';
import cors from 'cors';
import allRoutes from './rest/routes/routes.js';
import logger from './libs/logger.js';

const { SERVER_BIND, SERVER_PORT } = env;

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const errorHandler = (error, req) => {
  let message = 'Internal Server Error';
  let statusCode = 500;
  if (error instanceof ApiError) {
    message = error.message;
    statusCode = error.statusCode;
  }
  logger.error(`Error occurred: ${req.url}/${req.method} => ${error}, Status Code: ${statusCode}`);
  return { message, statusCode };
};

const routeHandler = (action, requiredParams) => async (req, res) => {
  let success = true;
  let statusCode = 200;
  let message = null;
  let result = {};
  try {
    // 요청 방식에 따라 적절한 데이터를 가져옴
    const data = {
      ...{ ...req.body, ...req.params, ...req.query },
      ...req.user,
    };
    // 필수 파라미터 검증
    const missingParams = requiredParams.filter((param) => param && !`${data[param]}`.trim());

    if (missingParams.length > 0) {
      throw new ApiError(`Missing required parameters: ${missingParams.join(', ')}`, 422);
    }

    // 서비스 호출 및 결과 반환
    result = await action({ ...data });
  } catch (error) {
    success = false;
    const errorInfo = errorHandler(error, req);
    message = errorInfo.message;
    statusCode = errorInfo.statusCode;
  } finally {
    res.status(statusCode).json({ success, ...(message && { message }), ...result });
  }
};

//모든 라우팅 등록
allRoutes.forEach((api) => {
  const { method, url, action, middleware, requiredParams } = api;
  app[method](url, ...middleware, routeHandler(action, requiredParams));
});

// 에러 처리 미들웨어
app.use((error, req, res, next) => {
  const { message, statusCode } = errorHandler(error, req);
  res.status(statusCode).json({ success: false, message });
});

const server = createServer(app);
//app.use(express.static('public'));
//await redisServiceManager.connect();
await initSocket(server);

server.listen(SERVER_PORT, SERVER_BIND, async () => {
  logger.info(`Server is running on : ${SERVER_BIND}:${SERVER_PORT}`);

  try {
    const assets = await loadGameAssets();
    logger.info(`Assets loaded success `);
  } catch (e) {
    logger.error(`Assets loaded failed : ${e}`);
  }
});
