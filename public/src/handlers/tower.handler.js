import { buyTower } from '../Socket.js';

// 타워 구매
export const buyTowerhandler = (data) => {
  buyTower(data);
};
