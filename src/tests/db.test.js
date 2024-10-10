import db from '../managers/database.manager.js';
//실행 명령어 : node .\src\tests\db.test.js

const prisma = db.prisma;
await db.redis.connect();

// 데이터 넣는 예제
const email = 'test3@test.com';
const playerData = {
  email,
  password: 'dkdkdkdkdladpdp1!',
  name: '테스트계정',
  highScore: 0,
};

await db.createData('player', playerData);

const result = await db.findUnique('player', { where: { email } });
console.log(result);
