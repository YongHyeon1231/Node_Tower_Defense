import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Prisma 클라이언트를 내보내어 다른 모듈에서 사용할 수 있게 합니다.
 */
export default { prisma };
