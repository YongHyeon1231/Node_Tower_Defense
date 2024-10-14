import prisma from '../../managers/prisma.manager.js';

export const createPlayer = async (name, email, password) => {
  return await prisma.player.create({
    data: {
      name: name,
      password: password,
      email: email,
    },
  });
};

export const findPlayerByEmail = async (email) => {
  return await prisma.player.findUnique({ where: { email } });
};

export const updatePlayerNameById = async (id, targetName) => {
  return await prisma.player.update({
    where: { id },
    data: {
      name: targetName,
    },
  });
};
