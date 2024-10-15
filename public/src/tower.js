import { getGameData } from './index.js';

//
export class Tower {
  constructor(x, y, cost, i) {
    // 생성자 안에서 타워들의 속성을 정의한다고 생각하시면 됩니다!
    this.towersData = getGameData().towers;
    this.towerNum = i;
    this.x = x; // 타워 이미지 x 좌표
    this.y = y; // 타워 이미지 y 좌표
    this.width = 40; // 타워 이미지 가로 길이 (이미지 파일 길이에 따라 변경 필요하며 세로 길이와 비율을 맞춰주셔야 합니다!)
    this.height = 60; // 타워 이미지 세로 길이
    this.attackPower = this.towersData[i].damage; // 타워 공격력
    this.range = this.towersData[i].damageRange; // 타워 사거리
    this.cost = cost; // 타워 구입 비용
    this.cooldown = 0.0; // 타워 공격 쿨타임
    this.attackCooltime = this.towersData[i].attackCooltime;
    this.beamDuration = 0; // 타워 광선 지속 시간
    this.target = null; // 타워 광선의 목표
    this.towerLevel = 0;
  }

  draw(ctx, towerImage, delta) {
    ctx.drawImage(towerImage, this.x, this.y, this.width, this.height);
    if (this.beamDuration > 0 && this.target) {
      ctx.beginPath();
      ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2);
      ctx.lineTo(this.target.x + this.target.width / 2, this.target.y + this.target.height / 2);
      ctx.strokeStyle = 'skyblue';
      ctx.lineWidth = 10;
      ctx.stroke();
      ctx.closePath();
      this.beamDuration -= delta;
    }
  }

  attack(monster) {
    if (this.cooldown <= 0) {
      monster.hp -= this.attackPower + this.towerLevel * 50;
      this.cooldown += this.attackCooltime; // 3초 쿨타임 (초당 60프레임)
      this.beamDuration = 500; // 광선 지속 시간 (0.5초)
      this.target = monster;
    }
  }

  updateCooldown(deltaTime) {
    if (this.cooldown >= 0) {
      this.cooldown -= deltaTime;
    }
  }
}
