import jwt from 'jsonwebtoken';
import env from '../../libs/env.js';
import logger from '../../libs/logger.js'; // 로깅 시스템 추가
const { JWT_SECRET } = env;
import ApiError from '../../errors/api-error.js';
import { findPlayerByEmail } from '../repositories/users.repository.js';
//import { findUserByUserId } from '../repositories/users-repository.js'; // 유저 정보를 DB에서 가져오는 함수

export const tokenVerify = async (req, res, next) => {
  let token = req.headers['authorization'];
  token = token && token.split(' ')[1];

  if (token) {
    try {
      // 토큰 검증
      const decodedToken = jwt.verify(token, JWT_SECRET);
      const playerEmail = decodedToken.email;
      const user = await findPlayerByEmail(playerEmail);
      if (!user) {
        throw new ApiError('토큰 사용자가 존재하지 않습니다.', 401);
      }

      // 데이터 값 저장
      req.user = user;
    } catch (error) {
      logger.warn(`Token verification or user fetch error: ${error.message}`);
      // 인증이 필요 없는 경우 여기서 에러를 반환하지 않고 다음으로 넘어감
    }
  }
  next();
};
