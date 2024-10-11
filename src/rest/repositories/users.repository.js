import prisma from '../../managers/prisma.manager.js';
import { signup } from '../services/users.service.js';
// import bcrypt from "bcrypt";

// const hashedPassword = await bcrypt.hash(password, 10);
export const createUser = async ({ userId, password, userName }) => {
  return prisma.create({
    data: {
      userId: signup.userId,
      password: hashedPassword,
      userName: signup.userName,
    },
  });
  return res.status(201).json({ message: '회원가입이 완료되었습니다.' });
};

export const findUserById = async (userId) => {
  return await prisma.users.findUnique({ where: { id: userId } });
};

export const findUserByUserId = async (userId, includeInfo = false) => {
  return await prisma.users.findUnique({
    where: { userId },
    include: includeInfo
      ? {
          MMR: true,
        }
      : {},
  });
};
export const findUserByUsername = async (userName) => {
  return await prisma.users.findUnique({
    where: { username: userName },
  });
};

export const updateUserCash = async (userId, cash) => {
  try {
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { cash: { increment: cash } },
      select: { cash: true },
    });
    return updatedUser.cash;
  } catch (error) {
    throw new ApiError('Failed to update user cash', 500);
  }
};

export const getAthletesByUserId = async (userId) => {
  try {
    const athletes = await prisma.usersAthlete.findMany({
      where: { userId },
      include: {
        Athlete: true,
      },
    });
    return athletes;
  } catch (error) {
    throw new ApiError('Failed to retrieve athletes for the user', 500);
  }
};
