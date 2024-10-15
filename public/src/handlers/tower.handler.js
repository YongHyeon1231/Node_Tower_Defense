import { requestBuyTower, requestSellTower, requestUpgradeTower } from '../Socket.js';

// 타워 구매
export const buyTowerhandler = (data) => {
  requestBuyTower(data);
};

export const sellTowerhandler = (data) => {
  requestSellTower(data);
};

export const upgradeTowerhandler = (data) => {
  requestUpgradeTower(data);
};
