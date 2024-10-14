import ApiError from '../../errors/api-error.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import flattenedConfig from '../../libs/env.js';

import {
  createPlayer,
  findPlayerByEmail,
  updatePlayerNameById,
} from '../repositories/users.repository.js';

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
};

export const changeName = async ({ id, targetName }) => {
  await updatePlayerNameById(id, targetName);

  return {
    message: '이름 변경 성공',
    name: targetName,
  };
};
