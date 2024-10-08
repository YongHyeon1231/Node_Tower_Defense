import jwt from 'jsonwebtoken';
import env from '../../libs/env.js';
import logger from '../../libs/logger.js'; // 로깅 시스템 추가
const { JWT_SECRET } = env;
import ApiError from '../../errors/api-error.js';
//import { findUserByUserId } from '../repositories/users-repository.js'; // 유저 정보를 DB에서 가져오는 함수

export const tokenVerify = async (req, res, next) => {
  let token = req.headers['authorization'];
  token = token && token.split(' ')[1];

  if (token) {
    try {
      // 토큰 검증
      const user = jwt.verify(token, JWT_SECRET);

      // const userFromDB = await findUserByUserId(user.userId);
      // if (!userFromDB) {
      //   throw new ApiError('User not found', 401);
      // }

      // // req.user에 유저 정보 설정
      // req.user = {
      //   Id: userFromDB.id,
      //   userId: user.userId,
      //   username: user.username,
      //   usernameFromDB: userFromDB.username,
      // };
    } catch (error) {
      logger.warn(`Token verification or user fetch error: ${error.message}`);
      // 인증이 필요 없는 경우 여기서 에러를 반환하지 않고 다음으로 넘어감
    }
  }
  next();
};
