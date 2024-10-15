import { Base } from './base.js';
import { Monster } from './monster.js';
import { Tower } from './tower.js';



/* 
  어딘가에 엑세스 토큰이 저장이 안되어 있다면 로그인을 유도하는 코드를 여기에 추가해주세요!
*/
// 이전 스테이지 저장
let prevStage = 12001;
export const setPrevStage = (changeStage) => {
  prevStage = changeStage;
};
export const getPrevStage = () => {
  return prevStage;
};

// 현재 스테이지 저장
let currentStage = 12001;
export const setCurrentStage = (changeStage) => {
  currentStage = changeStage;
};
export const getCurrentStage = () => {
  return currentStage;
};

let serverSocket; // 서버 웹소켓 객체
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const NUM_OF_MONSTERS = 5; // 몬스터 개수
const NUM_OF_TOWERS = 3; // 몬스터 개수

let userGold = 10000; // 유저 골드
let base; // 기지 객체
// 플레이어의 기지 체력
let baseHp = 1000; // 기지 체력

let towerCost = 100; // 타워 구입 비용
let upgradeCost = 1000;
let numOfInitialTowers = 5; // 초기 타워 개수
let maxTowerNum = 50;
let monsterLevel = 1; // 몬스터 레벨

// 몬스터 생성 주기는 스테이지별로 받아와서 생성
let monsterSpawnInterval = 60; // 몬스터 생성 주기, 현재는 60프레임, 원래는 1000ms
const monsters = [];
const towers = [];

let score = 0; // 게임 점수
let highScore = 0; // 기존 최고 점수
let isInitGame = false;

// 이미지 로딩 파트
const backgroundImage = new Image();
backgroundImage.src = 'images/bg.webp';

const towerImages = [];
for (let i = 1; i <= NUM_OF_TOWERS; i++) {
  const img = new Image();
  img.src = `images/tower${i}.png`;
  towerImages.push(img);
}

const baseImage = new Image();
baseImage.src = 'images/base.png';

const pathImage = new Image();
pathImage.src = 'images/path.png';

const monsterImages = [];
for (let i = 1; i <= NUM_OF_MONSTERS; i++) {
  const img = new Image();
  img.src = `images/monster${i}.png`;
  monsterImages.push(img);
}

let monsterPath;

function generateRandomMonsterPath() {
  const path = [];
  let currentX = 0;
  let currentY = Math.floor(Math.random() * 21) + 500; // 500 ~ 520 범위의 y 시작 (캔버스 y축 중간쯤에서 시작할 수 있도록 유도)

  path.push({ x: currentX, y: currentY });

  while (currentX < canvas.width) {
    currentX += Math.floor(Math.random() * 100) + 50; // 50 ~ 150 범위의 x 증가
    // x 좌표에 대한 clamp 처리
    if (currentX > canvas.width) {
      currentX = canvas.width;
    }

    currentY += Math.floor(Math.random() * 200) - 100; // -100 ~ 100 범위의 y 변경
    // y 좌표에 대한 clamp 처리
    if (currentY < 0) {
      currentY = 0;
    }
    if (currentY > canvas.height) {
      currentY = canvas.height;
    }

    path.push({ x: currentX, y: currentY });
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

  return {
    x: Math.floor((posX + offsetX) * 0.8), // 타워가 기지에 너무 붙어서 생성되는 것 방지 (x위치 보정)
    y: posY + offsetY,
  };
}

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
  // numOfInitialTowers를 플레이어에서 받아와서 생성
  for (let i = 0; i < numOfInitialTowers; i++) {
    let { x, y } = getRandomPositionNearPath(200);
    // for (let j = 0; j < towers.length; j++) {
    //   while (!isValidNewCoordinate(towers, x, y)) {
    //     const newPosition = getRandomPositionNearPath(200);
    //     x = newPosition.x;
    //     y = newPosition.y;
    //   }
    // }
    let towerNum = Math.floor(Math.random() * 3);
    const tower = new Tower(x, y, towerCost, towerNum);
    towers.push(tower);
    tower.draw(ctx, towerImages[towerNum]);
  }
}

function placeNewTower() {
  /* 
    타워를 구입할 수 있는 자원이 있을 때 타워 구입 후 랜덤 배치하면 됩니다.
    빠진 코드들을 채워넣어주세요! 
  */
  if (userGold >= towerCost && towers.length < maxTowerNum) {
    let { x, y } = getRandomPositionNearPath(200);
    // for (let j = 0; j < towers.length; j++) {
    //   while (!isValidNewCoordinate(towers, x, y)) {
    //     const newPosition = getRandomPositionNearPath(200);
    //     x = newPosition.x;
    //     y = newPosition.y;
    //   }
    // }
    let towerNum = Math.floor(Math.random() * 3);
    console.log(towerNum);
    const tower = new Tower(x, y, towerCost, towerNum);
    towers.push(tower);
    tower.draw(ctx, towerImages[towerNum]);
    userGold -= towerCost;
  }
}

function upgradeTowers() {
  if (userGold >= upgradeCost) {
    for (let i = 0; i < towers.length; i++) {
      towers[i].towerLevel += 1;
    }
  }
  userGold -= upgradeCost;
}

function placeBase() {
  const lastPoint = monsterPath[monsterPath.length - 1];
  base = new Base(lastPoint.x, lastPoint.y, baseHp);
  base.draw(ctx, baseImage);
}

function spawnMonster() {
  if (monsters.length < 10) {
    // 10이 아니라 나중에 스테이지별로 몬스터의 수를 받아와야함
    monsters.push(new Monster(monsterPath, monsterImages, monsterLevel));
  }
}

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

  ctx.font = '25px Times New Roman';
  ctx.fillStyle = 'skyblue';
  ctx.fillText(`최고 기록: ${highScore}`, 100, 50); // 최고 기록 표시
  ctx.fillStyle = 'white';
  ctx.fillText(`점수: ${score}`, 100, 100); // 현재 스코어 표시
  ctx.fillStyle = 'yellow';
  ctx.fillText(`골드: ${userGold}`, 100, 150); // 골드 표시
  ctx.fillStyle = 'black';
  ctx.fillText(`현재 레벨: ${monsterLevel}`, 100, 200); // 최고 기록 표시

  // 타워 그리기 및 몬스터 공격 처리
  towers.forEach((tower) => {
    tower.draw(ctx, towerImages[tower.towerNum]);
    tower.updateCooldown();
    monsters.forEach((monster) => {
      const distance = Math.sqrt(
        Math.pow(tower.x - monster.x, 2) + Math.pow(tower.y - monster.y, 2),
      );
      if (distance < tower.range) {
        tower.attack(monster);
      }
    });
  });

  // 몬스터가 공격을 했을 수 있으므로 기지 다시 그리기
  base.draw(ctx, baseImage);

  for (let i = monsters.length - 1; i >= 0; i--) {
    const monster = monsters[i];
    if (monster.hp > 0) {
      const isDestroyed = monster.move(base);
      if (isDestroyed) {
        /* 게임 오버 */
        alert('게임 오버. 스파르타 본부를 지키지 못했다...ㅠㅠ');
        location.reload();
      }
      monster.draw(ctx);
    } else {
      /* 몬스터가 죽었을 때 */
      //monsters.splice(i, 1);
      //점수, 골드 추가
      killMonster(i);
    }
  }
  //스테이지(monsterLevel) 업데이트
  monsterLevel = Math.floor(score / 50) + 1;

  //몬스터 스폰을 프레임단위로 업데이트
  monsterSpawnInterval -= 1;
  if (monsterSpawnInterval === 0) {
    spawnMonster();
    monsterSpawnInterval += 60;
  }

  requestAnimationFrame(() => gameLoop(currentTime, elapsedTime)); // 지속적으로 다음 프레임에 gameLoop 함수 호출할 수 있도록 함
}

function killMonster(i) {
  userGold += monsters[i].killGold;
  score += monsters[i].killScore;
  monsters.splice(i, 1);
}

function initGame() {
  if (isInitGame) {
    return;
  }


  monsterPath = generateRandomMonsterPath(); // 몬스터 경로 생성
  initMap(); // 맵 초기화 (배경, 몬스터 경로 그리기)
  placeInitialTowers(); // 설정된 초기 타워 개수만큼 사전에 타워 배치
  placeBase(); // 기지 배치

  //setInterval(spawnMonster, monsterSpawnInterval); // 설정된 몬스터 생성 주기마다 몬스터 생성
  gameLoop(); // 게임 루프 최초 실행
  isInitGame = true;
}

// 이미지 로딩 완료 후 서버와 연결하고 게임 초기화
Promise.all([
  new Promise((resolve) => (backgroundImage.onload = resolve)),
  ...towerImages.map((img) => new Promise((resolve) => (img.onload = resolve))),
  new Promise((resolve) => (baseImage.onload = resolve)),
  new Promise((resolve) => (pathImage.onload = resolve)),
  ...monsterImages.map((img) => new Promise((resolve) => (img.onload = resolve))),
]).then(() => {
  initGame();
});

const buyTowerButton = document.createElement('button');
buyTowerButton.textContent = '타워 구입';
buyTowerButton.style.position = 'absolute';
buyTowerButton.style.top = '10px';
buyTowerButton.style.right = '10px';
buyTowerButton.style.padding = '10px 20px';
buyTowerButton.style.fontSize = '16px';
buyTowerButton.style.cursor = 'pointer';

buyTowerButton.addEventListener('click', placeNewTower);

document.body.appendChild(buyTowerButton);

const upgradeTowerButton = document.createElement('button');
upgradeTowerButton.textContent = '타워 업그레이드';
upgradeTowerButton.style.position = 'absolute';
upgradeTowerButton.style.top = '10px';
upgradeTowerButton.style.right = '140px';
upgradeTowerButton.style.padding = '10px 20px';
upgradeTowerButton.style.fontSize = '16px';
upgradeTowerButton.style.cursor = 'pointer';

upgradeTowerButton.addEventListener('click', upgradeTowers);

document.body.appendChild(upgradeTowerButton);
