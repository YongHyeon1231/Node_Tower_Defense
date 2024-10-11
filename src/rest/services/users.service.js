import ApiError from '../../errors/api-error.js';
import prisma from '../../libs/prisma.js';
import { createUser } from '../repositories/users.repository.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userValidatorJoi from '../middleware/validators/userValidator.middleware.js';
import {
  createUser,
  findUserById,
  findUserByUserId,
  findUserByUsername,
} from '../repositories/users.repository.js';

export const signup = async ({ userId, password, userName }) => {
  
  const hashedPassword = await bcrypt.hash(password, 10);
  // 성공적으로 통과할 경우
  return {
    message: '회원가입 성공',
    userId,
    userName,
  };
};

export const login = async ({ userId, password }) => {
  const user = await createUser(userId);
  if (!user) {
    throw new ApiError('요청하신 정보가 없습니다', 400);
  }
  if (!(await bcrypt.compare(password, user.password))) {
    throw new ApiError('비밀번호가 일치하지않습니다', 400);
  }
  const token = jwt.sign({ userId: user.userId }, 'custom-secret-key');
  const refreshToken = jwt.sign(
    { userId: user.userId, password: user.password },
    'custom-secret-key',
  );
  return { token, refreshToken };
};

export const enhanceAthletes = async ({ Id = null, athleteIds }) => {
  return await prisma.$transaction(async (prisma) => {
    const athletes = await getAthletesByIds(Id, athleteIds);

    if (athletes.length !== 3) {
      throw new ApiError('All athletes must belong to the user.', 400);
    }

    const firstAthlete = athletes[0];

    const isSameAthlete = athletes.every((athlete) => athlete.athleteId === firstAthlete.athleteId);
    const isSameEnhance = athletes.every((athlete) => athlete.enhance === firstAthlete.enhance);

    if (!isSameAthlete || !isSameEnhance) {
      throw new ApiError('All athletes must have the same Athlete ID and enhancement level.', 400);
    }

    const isInTeam = await checkIfAthletesInTeam(Id, athleteIds);
    if (isInTeam) {
      throw new ApiError(
        'One or more athletes are assigned to a team and cannot be enhanced.',
        400,
      );
    }

    await deleteAthletesByIds(Id, athleteIds, prisma);

    const enhancedAthlete = await createEnhancedAthlete(
      Id,
      {
        athleteId: firstAthlete.athleteId,
        enhance: firstAthlete.enhance + 1,
      },
      prisma,
    );

    return enhancedAthlete;
  });
};

export const sellAthlete = async ({ Id = null, athleteId }) => {
  return await prisma.$transaction(async (prisma) => {
    const athlete = await getAthleteById(Id, athleteId);

    if (!athlete) {
      throw new ApiError('Athlete not found or does not belong to the user.', 404);
    }

    const cashEarned = athlete.enhance ** athlete.enhance * 1000;

    await updateUserCash(Id, cashEarned, prisma);

    await deleteAthleteById(athleteId, prisma);

    return { message: 'Athlete sold successfully', cashEarned };
  });
};
