import ApiError from '../../errors/api-error.js';

/**
 * 요청에 유효한 토큰이 있는지 확인하는 미들웨어
 * 유저가 인증되었는지 확인하며, 인증되지 않은 경우 에러를 반환합니다.
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 * @param {Function} next - 다음 미들웨어로 제어를 전달하는 함수
 * @returns {void}
 */
export const authenticateToken = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError('Token is required or invalid', 401));
  }
  return next();
};
