import ApiError from '../../errors/api-error.js';
<<<<<<< HEAD
import prisma from '../../managers/prisma.manager.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import {
  createUser,
  findUserById,
  findUserByUserId,
  findUserByUsername,
} from '../repositories/users.repository.js';

export const signup = async ({ email, password, name }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  // 성공적으로 통과할 경우
  return {
    message: '회원가입 성공',
    name,
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
=======
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import flattenedConfig from '../../libs/env.js';

import { createPlayer, findPlayerByEmail } from '../repositories/users.repository.js';

const { JWT_SECRET, JWT_EXPIRES_IN, JWT_ALGORITHM, JWT_AUDIENCE, JWT_ISSUER } = flattenedConfig;

export const signUp = async ({ email, password, name }) => {
  try {
    const isExistUser = await findPlayerByEmail(email);

    if (isExistUser) {
      throw new ApiError('이미 존재하는 유저입니다.', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // 성공적으로 통과할 경우

    await createPlayer(name, email, hashedPassword);

    return {
      message: '회원가입 성공',
      name,
    };
  } catch (error) {
    throw error;
  }
};

export const signIn = async ({ email, password }) => {
  try {
    const player = await findPlayerByEmail(email);

    if (!player) {
      throw new ApiError('플레이어를 찾을 수 없습니다.', 400);
    } else if (!(await bcrypt.compare(password, player.password))) {
      throw new ApiError('비밀번호가 일치하지 않습니다.', 400);
    }

    const token = jwt.sign(
      {
        email: email,
        name: player.name,
        id: player.id,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
        algorithm: JWT_ALGORITHM,
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      },
    );

    return {
      token: token,
      message: '로그인 성공',
    };
  } catch (error) {
    throw error;
  }
>>>>>>> PYH
};
