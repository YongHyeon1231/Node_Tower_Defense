import Utils from '../../libs/utils.js';
import { tokenVerify } from '../middleware/token.middleware.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import userRoutes from './users.route.js';

const allRoutes = [
  ...userRoutes,
  // 다른 라우트 추가 가능
];

// 파라미터 및 미들웨어 자동 설정
allRoutes.forEach((route) => {
  route.middleware = [tokenVerify];

  if (route.authRequired) {
    route.middleware.push(authenticateToken);
  }

  if (route.validator) {
    route.middleware.push(route.validator);
  }
});

export default allRoutes;
