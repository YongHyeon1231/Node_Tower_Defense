import { buyTower, sellTower, upgradeTower } from '../Socket.js';

// 타워 구매
export const buyTowerhandler = (data) => {
  buyTower(data);
};

export const sellTowerhandler = (data) => {
  sellTower(data);
};

export const upgradeTowerhandler = (data) => {
  upgradeTower(data);
};
