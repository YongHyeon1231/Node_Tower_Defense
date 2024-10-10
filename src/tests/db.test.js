import db from '../managers/database.manager.js';

const prisma = db.prisma;
await db.redis.connect();

// 데이터 넣는 예제
const email = 'test@test.com';
const playerData = {
  email,
  password: 'dkdkdkdkdladpdp1!',
  name: '테스트계정',
  highScore: 0,
};

const createPlayer = async () => {
  return prisma.player.create({
    data: playerData,
  });
};
await db.setData(`email:${email}`, playerData, createPlayer);

//값 가져오기 예제
const findPlayer = async () => {
  return prisma.player.findUnique({
    where: {
      id: 1,
    },
  });
};
await db.getData(`email:${email}`, findPlayer);
