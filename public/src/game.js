import { Base } from './base.js';
import { Monster } from './monster.js';
import { Tower } from './tower.js';
import { getGameData } from './index.js';
import {
  requestKillMonster,
  requestSpawnMonster,
  requestSellTower,
  requestBuyTower,
  requestUpgradeTower,
  requestNextStage,
  requestGameEnd,
} from './Socket.js';
//#region Monster Spawn
let stageData = getGameData().stages;
let maxMonsterCount = 0;
const monsterData = getGameData().monsters;
let isLastStage = false;
let isStageComplete = false;

document.addEventListener('SpawnMonster', (data) => {
  spawnMonster(data.detail);
});

// 몬스터 소환 함수
function spawnMonster(data) {
  requestingSpawnMonster = false;
  if (spawnMonsterCount >= maxMonsterCount) {
    return;
  }

  const { spawnMonsterId, monsterUUID } = data;

  const monsterNumber = monsterData.findIndex((data) => data.id === spawnMonsterId);
  const monsterInfo = monsterData[monsterNumber];
  //console.log('소환할 몬스터 =>', spawnMonsterId, ' , ', monsterImages[spawnMonsterId]);
  const monster = new Monster(
    monsterPath,
    monsterNumber,
    monsterImages[spawnMonsterId],
    monsterLevel,
    monsterInfo,
    monsterUUID,
  );
  monsters.push(monster);
  spawnMonsterCount++;
}

document.addEventListener('StageMoved', (data) => {
  changeStage(data.detail.nextStage);
});

// 새로운 스테이지로 변경 시 호출될 함수
function changeStage(newStageId) {
  console.log('스테이지 넘어감');
  killedMonsterCount = 0;
  spawnMonsterCount = 0;
  currentStageLevel = stageData.findIndex((stage) => stage.id === newStageId);
  const stageInfo = stageData[currentStageLevel++];

  isLastStage = stageData.findIndex((stage) => stage.id === newStageId);
  isLastStage = isLastStage === -1 || isLastStage + 1 >= stageData.length;
  maxMonsterCount = stageInfo.monsterCount;
  monsterSpawnInterval = 1000.0;
  monsters.length = 0; // 남은 몬스터 초기화 (애초에 있으면 안되긴함)
  isStageComplete = false; // 스테이지 완료 여부 초기화
  requestingSpawnMonster = false; //요청한적 없는 걸로 함
}

document.addEventListener('KillMonster', (data) => {
  killMonster(data.detail);
});
// 몬스터 죽였을때 로직
function killMonster(data) {
  killedMonsterCount++;
  userGold = Number(data.gold);
  score = Number(data.score);
  monsterLevel = Number(data.monsterLevel);

  const monsterIndex = monsters.findIndex((monster) => monster.monsterUUID == data.monsterUUID);
  if (monsterIndex !== -1) {
    monsters.splice(monsterIndex, 1);
  }

  if (killedMonsterCount >= maxMonsterCount) {
    if (isLastStage) {
      requestGameEnd();
      alert('모든 스테이지 완료! 게임 클리어!');
    } else {
      isStageComplete = true;
      requestNextStage();
    }
  }
}

//#endregion

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const NUM_OF_TOWERS = 3; // 몬스터 개수

let userGold = 0; // 유저 골드
let base; // 기지 객체
// 플레이어의 기지 체력
let baseHp = 1000; // 기지 체력

let towerCost = 100; // 타워 구입 비용
let upgradeCost = 100;
let numOfInitialTowers = 5; // 초기 타워 개수
let maxTowerNum = 30;
let monsterLevel = 1; // 몬스터 레벨
let currentStageLevel = 1; //

// 몬스터 생성 주기는 스테이지별로 받아와서 생성
let monsterSpawnInterval = 1000; // 몬스터 생성 주기 1000ms
let killedMonsterCount = 0; //죽인 몬스터 수
let spawnMonsterCount = 0;
const monsters = [];
const towers = [];

let score = 0; // 게임 점수
let highScore = 0; // 기존 최고 점수
let isInitGame = false;

// 이미지 로딩 파트
const backgroundImage = new Image();
backgroundImage.src = 'images/bg.webp';

const towerImages = [];
for (let j = 1; j <= NUM_OF_TOWERS; j++) {
  for (let i = 1; i <= 3; i++) {
    const img = new Image();
    img.src = `images/tower${i}_${j}.png`;
    towerImages.push(img);
  }
}

const baseImage = new Image();
baseImage.src = 'images/base.png';

const pathImage = new Image();
pathImage.src = 'images/path.png';

// 몬스터 이미지 로딩 파트
const monsterImages = {};
async function loadMonsterImages() {
  const response = await fetch('assets/monster.json');

  const json = await response.json();
  const keys = Object.keys(json.data);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    const img = new Image();
    img.src = `images/${json.data[key]}.png`;
    monsterImages[key] = img;
  }
}

//

let monsterPath;

function generateRandomMonsterPath() {
  const path = [];
  let currentX = 0;
  let currentY = Math.floor(canvas.height * 0.5);

  const endX = canvas.width - 50;
  const minY = canvas.height * 0.3; // Y축 범위 최소값 (잔디 영역 내 최소)
  const maxY = canvas.height * 0.7; // Y축 범위 최대값 (잔디 영역 내 최대)
  const maxHorizontalSegments = 5; // 수평 구간을 제한해서 경로가 너무 직선으로만 이어지지 않도록
  const maxExitDistance = canvas.width * 0.1;

  let horizontalSegmentCount = 0;
  let previousDirection = 'right'; // 경로의 초기 방향은 오른쪽으로 진행

  path.push({ x: currentX, y: currentY });

  const maxSegmentLength = 100; // 구간 길이
  const maxSegments = Math.floor(Math.random() * 50.0) + 30; // 구간 개수

  for (let i = 0; i < maxSegments; i++) {
    const distanceToExit = endX - currentX;

    // 출구로 직선 이동 조건: 수평 구간이 너무 많지 않도록 제한
    if (distanceToExit < maxExitDistance && horizontalSegmentCount < maxHorizontalSegments) {
      currentX = endX;
      path.push({ x: currentX, y: currentY });
      break;
    }

    const segmentLength = Math.floor(Math.random() * maxSegmentLength) + 100;
    // 경로는 직각으로 꺾이도록 설정
    if (previousDirection === 'right') {
      // 이전에 수평으로 이동했으면, 이번엔 위/아래로 직각 꺾기
      const newY = currentY + (Math.random() < 0.5 ? segmentLength : -segmentLength);
      if (newY >= minY && newY <= maxY) {
        // Y축 경계 내에서만 움직임
        currentY = newY;
        previousDirection = 'up-down';
        horizontalSegmentCount = 0; // 수평 구간을 다시 리셋
      }
    } else {
      // 이전에 수직으로 이동했으면, 이번엔 오른쪽으로 직각 꺾기
      currentX += segmentLength;
      horizontalSegmentCount += 1; // 수평 구간 카운트 증가
      previousDirection = 'right';
    }

    // 경계 처리: 잔디 영역 내에서만 경로가 생성되도록 X, Y 좌표를 제한
    currentX = Math.max(0, Math.min(currentX, endX));
    currentY = Math.max(minY, Math.min(currentY, maxY));

    // 뒤로 가는 경로 방지
    if (i > 0 && currentX < path[i - 1].x) {
      currentX = path[i - 1].x;
    }

    path.push({ x: currentX, y: currentY });

    // 경로가 끝나는 조건
    if (currentX >= endX) {
      break;
    }
  }

  // 경로가 끝까지 도달하지 않으면 마지막에 도착 지점 추가
  if (currentX < endX) {
    path.push({ x: endX, y: currentY });
  }

  return path;
}

function initMap() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // 배경 이미지 그리기
  drawPath();
}

function drawPath() {
  const segmentLength = 20; // 몬스터 경로 세그먼트 길이
  const imageWidth = 60; // 몬스터 경로 이미지 너비
  const imageHeight = 60; // 몬스터 경로 이미지 높이
  const gap = 5; // 몬스터 경로 이미지 겹침 방지를 위한 간격

  for (let i = 0; i < monsterPath.length - 1; i++) {
    const startX = monsterPath[i].x;
    const startY = monsterPath[i].y;
    const endX = monsterPath[i + 1].x;
    const endY = monsterPath[i + 1].y;

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY); // 피타고라스 정리로 두 점 사이의 거리를 구함 (유클리드 거리)
    const angle = Math.atan2(deltaY, deltaX); // 두 점 사이의 각도는 tan-1(y/x)로 구해야 함 (자세한 것은 역삼각함수 참고): 삼각함수는 변의 비율! 역삼각함수는 각도를 구하는 것!

    for (let j = gap; j < distance - gap; j += segmentLength) {
      // 사실 이거는 삼각함수에 대한 기본적인 이해도가 있으면 충분히 이해하실 수 있습니다.
      // 자세한 것은 https://thirdspacelearning.com/gcse-maths/geometry-and-measure/sin-cos-tan-graphs/ 참고 부탁해요!
      const x = startX + Math.cos(angle) * j; // 다음 이미지 x좌표 계산(각도의 코사인 값은 x축 방향의 단위 벡터 * j를 곱하여 경로를 따라 이동한 x축 좌표를 구함)
      const y = startY + Math.sin(angle) * j; // 다음 이미지 y좌표 계산(각도의 사인 값은 y축 방향의 단위 벡터 * j를 곱하여 경로를 따라 이동한 y축 좌표를 구함)
      drawRotatedImage(pathImage, x, y, imageWidth, imageHeight, angle);
    }
  }
}

function drawRotatedImage(image, x, y, width, height, angle) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(angle);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();
}

function getRandomPositionNearPath(maxDistance) {
  // 타워 배치를 위한 몬스터가 지나가는 경로 상에서 maxDistance 범위 내에서 랜덤한 위치를 반환하는 함수!
  const segmentIndex = Math.floor(Math.random() * (monsterPath.length - 1));
  const startX = monsterPath[segmentIndex].x;
  const startY = monsterPath[segmentIndex].y;
  const endX = monsterPath[segmentIndex + 1].x;
  const endY = monsterPath[segmentIndex + 1].y;

  const t = Math.random();
  const posX = startX + t * (endX - startX);
  const posY = startY + t * (endY - startY);

  const offsetX = (Math.random() - 0.5) * 2 * maxDistance;
  const offsetY = (Math.random() - 0.5) * 2 * maxDistance;

  const pos = {
    x: Math.max(50, Math.min(canvas.width - 50, Math.floor((posX + offsetX) * 0.8))), // 타워가 기지에 너무 붙어서 생성되는 것 방지 (x위치 보정)
    y: Math.max(50, Math.min(canvas.height - 50, posY + offsetY)),
  };

  return pos;
}

// 겹치지 않는 타워 위치 찾기
function isValidNewCoordinate(towers, x, y) {
  const newX = x;
  const newY = y;

  for (let j = 0; j < towers.length; j++) {
    const towerX = towers[j].x;
    const towerY = towers[j].y;

    const xDistance = Math.abs(newX - towerX);
    const yDistance = Math.abs(newY - towerY);

    // x 방향으로 20 이상, y 방향으로 40 이상 떨어져 있는지 확인
    if (xDistance < 5 || yDistance < 10) {
      return false; // 거리가 충분히 떨어져 있지 않음
    }
  }
  return true; // 모든 기존 타워와 충분히 떨어져 있음
}

function placeInitialTowers() {
  /* 
    타워를 초기에 배치하는 함수입니다.
    무언가 빠진 코드가 있는 것 같지 않나요? 
  */
  for (let i = 0; i < numOfInitialTowers; i++) {
    let { x, y } = getRandomPositionNearPath(200);
    let towerNum = Math.floor(Math.random() * 3);
    const tower = new Tower(x, y, towerCost, towerNum);
    towers.push(tower);
    tower.draw(ctx, towerImages[towerNum * 3]);
    const data = {
      idx: towers[towers.length - 1].towerDataIdx,
      towerUUID: towers[towers.length - 1].towerUUID,
      x: x,
      y: y,
      towerLevel: 0,
    };
    requestBuyTower(data);
  }
}

function placeNewTower() {
  /* 
    타워를 구입할 수 있는 자원이 있을 때 타워 구입 후 랜덤 배치하면 됩니다.
    빠진 코드들을 채워넣어주세요! 
  */
  if (userGold >= towerCost && towers.length < maxTowerNum) {
    let { x, y } = getRandomPositionNearPath(200);
    let towerNum = Math.floor(Math.random() * 3);
    const tower = new Tower(x, y, towerCost, towerNum);
    towers.push(tower);
    tower.draw(ctx, towerImages[towerNum * 3]);
    userGold -= towerCost;

    const data = {
      idx: towers[towers.length - 1].towerDataIdx,
      towerUUID: towers[towers.length - 1].towerUUID,
      x: x,
      y: y,
      towerLevel: 1,
    };
    requestBuyTower(data);
  }
}

// 타워 업그레이드 함수
function upgradeTower(tower) {
  if (userGold >= upgradeCost && tower.towerLevel < 3) {
    tower.towerLevel += 1;
    userGold -= upgradeCost;
    console.log('타워 업그레이드 완료');
    const data = {
      idx: tower.towerDataIdx,
      towerUUID: tower.towerUUID,
      x: tower.x,
      y: tower.y,
      towerLevel: tower.towerLevel,
    };
    requestUpgradeTower(data);
  } else {
    console.log('업그레이드가 불가능합니다.');
  }
}

// 타워 판매 함수
function sellTower(tower) {
  const towerIndex = towers.indexOf(tower);
  if (towerIndex !== -1) {
    towers.splice(towerIndex, 1);
    userGold += towerCost * 0.5; // 판매 시 골드 회수
    console.log('타워 판매 완료');
    const data = {
      idx: tower.towerDataIdx,
      towerUUID: tower.towerUUID,
      x: tower.x,
      y: tower.y,
      towerLevel: tower.towerLevel,
    };
    requestSellTower(data);
  }
}

function placeBase() {
  const lastPoint = monsterPath[monsterPath.length - 1];
  base = new Base(lastPoint.x, lastPoint.y, baseHp);
  base.draw(ctx, baseImage);
}

let requestingSpawnMonster = false;
function gameLoop(previousTime = null, elapsedTime = null) {
  if (previousTime === null) {
    requestAnimationFrame(() => gameLoop(Date.now(), 0.0));
    return;
  }
  const currentTime = Date.now();
  const deltaTime = currentTime - previousTime;
  elapsedTime += deltaTime;
  // 렌더링 시에는 항상 배경 이미지부터 그려야 합니다! 그래야 다른 이미지들이 배경 이미지 위에 그려져요!
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // 배경 이미지 다시 그리기
  drawPath(monsterPath); // 경로 다시 그리기
  ctx.fillStyle = 'black';

  // 타워 그리기 및 몬스터 공격 처리
  towers.forEach((tower) => {
    tower.draw(ctx, towerImages[tower.towerNum + (tower.towerLevel - 1) * 3], deltaTime);
    tower.updateCooldown(deltaTime);

    monsters.forEach((monster) => {
      if (!monster.alive) {
        return;
      }

      const distance = Math.sqrt(
        Math.pow(tower.x - monster.x, 2) + Math.pow(tower.y - monster.y, 2),
      );
      if (distance < tower.range) {
        tower.attack(monster);
      }
    });
  });

  for (let i = monsters.length - 1; i >= 0; i--) {
    const monster = monsters[i];
    if (monster.alive) {
      const isDestroyed = monster.move(base);
      if (isDestroyed) {
        /* 게임 오버 */
        requestGameEnd();
        alert('게임 오버. 스파르타 본부를 지키지 못했다...ㅠㅠ');
        break;
      }
      monster.draw(ctx);
    } else if (!monster.requestedKill) {
      monster.requestedKill = true;
      requestKillMonster(monster.monsterUUID);
    }
  }
  //몬스터 스폰을 프레임단위로 업데이트
  monsterSpawnInterval -= deltaTime;
  if (monsterSpawnInterval <= 0.0 && !isStageComplete && !requestingSpawnMonster) {
    requestingSpawnMonster = true;
    requestSpawnMonster(); //서버에 몬스터 소환 요청
    monsterSpawnInterval += 1000.0;
  }

  base.draw(ctx, baseImage);

  ctx.font = '25px Times New Roman';
  ctx.fillStyle = 'skyblue';
  ctx.fillText(`최고 기록: ${highScore}`, 100, 50); // 최고 기록 표시
  ctx.fillStyle = 'white';
  ctx.fillText(`점수: ${score}`, 100, 100); // 현재 스코어 표시
  ctx.fillStyle = 'yellow';
  ctx.fillText(`골드: ${userGold}`, 100, 150); // 골드 표시
  ctx.fillStyle = 'white';
  ctx.fillText(`현재 레벨: ${monsterLevel}`, 100, 200); // 최고 기록 표시
  ctx.fillText(`스테이지: ${currentStageLevel}`, 100, 250);

  requestAnimationFrame(() => gameLoop(currentTime, elapsedTime)); // 지속적으로 다음 프레임에 gameLoop 함수 호출할 수 있도록 함
}

canvas.addEventListener('click', (event) => {
  const mouseX = event.clientX - canvas.getBoundingClientRect().left;
  const mouseY = event.clientY - canvas.getBoundingClientRect().top;

  towers.forEach((tower) => {
    if (
      mouseX >= tower.x &&
      mouseX <= tower.x + tower.width &&
      mouseY >= tower.y &&
      mouseY <= tower.y + tower.height
    ) {
      onTowerClick(tower);
    }
  });
});

export const initGame = (startGold, playerHighScore, stageId) => {
  if (isInitGame) {
    return;
  }
  const stage = stageData.find((stage) => stage.id == stageId);
  isInitGame = true;
  userGold = startGold;
  highScore = playerHighScore;
  maxMonsterCount = stage.monsterCount;
  monsterPath = generateRandomMonsterPath(); // 몬스터 경로 생성
  initMap(); // 맵 초기화 (배경, 몬스터 경로 그리기)
  placeInitialTowers(); // 설정된 초기 타워 개수만큼 사전에 타워 배치
  placeBase(); // 기지 배치

  console.log('초기화 완료');
  gameLoop(); // 게임 루프 최초 실행
};

// 이미지 로딩 완료 후 서버와 연결하고 게임 초기화
await loadMonsterImages();
await Promise.all([
  new Promise((resolve) => {
    backgroundImage.onload = resolve;
    if (backgroundImage.complete) resolve();
  }),
  ...towerImages.map(
    (img) =>
      new Promise((resolve) => {
        img.onload = resolve;
        if (img.complete) resolve();
      }),
  ),
  new Promise((resolve) => {
    baseImage.onload = resolve;
    if (baseImage.complete) resolve();
  }),
  new Promise((resolve) => {
    pathImage.onload = resolve;
    if (pathImage.complete) resolve();
  }),
  ...Object.values(monsterImages).map(
    (img) =>
      new Promise((resolve) => {
        img.onload = resolve;
        if (img.complete) resolve(); //너무 빠르거나 캐시된 이미지 불러오거나 하면 이벤트가 발생안할 수 있어서 직접 부르는 식으로 처리함.
      }),
  ),
]);

function addBuyTowerButton() {
  const rect = canvas.getBoundingClientRect();
  const buyTowerButton = document.createElement('button');
  buyTowerButton.textContent = '타워 구입';
  buyTowerButton.style.position = 'absolute';
  buyTowerButton.style.top = `${rect.top + 10}px`;

  buyTowerButton.style.padding = '10px 20px';
  buyTowerButton.style.fontSize = '16px';
  buyTowerButton.style.cursor = 'pointer';
  buyTowerButton.style.left = `${rect.left + rect.width - 150}px`;
  buyTowerButton.addEventListener('click', placeNewTower);
  document.body.appendChild(buyTowerButton);
}
addBuyTowerButton();
// 게임 초기화 시 버튼 미리 생성
const upgradeTowerButton = document.createElement('button');
const sellTowerButton = document.createElement('button');

upgradeTowerButton.textContent = '타워 업그레이드';
sellTowerButton.textContent = '타워 판매';

// 버튼 스타일 설정
[upgradeTowerButton, sellTowerButton].forEach((button) => {
  button.style.position = 'absolute';
  button.style.padding = '10px 20px';
  button.style.fontSize = '16px';
  button.style.cursor = 'pointer';
  button.style.display = 'none'; // 처음에 숨김
  document.body.appendChild(button);
});

// 타워 클릭 시 버튼 보이기
function onTowerClick(tower, mouseX, mouseY) {
  // 버튼 위치 설정
  const rect = canvas.getBoundingClientRect();
  upgradeTowerButton.style.left = `${rect.left + mouseX + 60}px`;
  upgradeTowerButton.style.top = `${mouseY + 60}px`;
  sellTowerButton.style.left = `${rect.left + mouseX + 60}px`;
  sellTowerButton.style.top = `${mouseY + 120}px`; // 아래쪽에 배치

  // 버튼 보이기
  upgradeTowerButton.style.display = 'block';
  sellTowerButton.style.display = 'block';

  upgradeTowerButton.onclick = () => {
    upgradeTower(tower);
    hideButtons();
  };

  sellTowerButton.onclick = () => {
    sellTower(tower);
    hideButtons();
  };
}

// 버튼 숨기기 함수
function hideButtons() {
  upgradeTowerButton.style.display = 'none';
  sellTowerButton.style.display = 'none';
}

// 캔버스 클릭 이벤트 처리
canvas.addEventListener('click', (event) => {
  const mouseX = event.clientX - canvas.getBoundingClientRect().left;
  const mouseY = event.clientY - canvas.getBoundingClientRect().top;

  let towerClicked = false; // 타워가 클릭되었는지 여부

  towers.forEach((tower) => {
    if (
      mouseX >= tower.x &&
      mouseX <= tower.x + tower.width &&
      mouseY >= tower.y &&
      mouseY <= tower.y + tower.height
    ) {
      onTowerClick(tower, mouseX, mouseY); // 마우스 좌표를 전달
      towerClicked = true; // 타워 클릭됨
    }
  });

  // 타워가 클릭되지 않았다면 버튼 숨김
  if (!towerClicked) {
    hideButtons();
  }
});
