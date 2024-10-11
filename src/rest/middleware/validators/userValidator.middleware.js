import Joi from 'joi';
import ApiError from '../../../errors/api-error.js';

const signUpSchema = Joi.object({
  // alphanum : 문자열 값에는 az, AZ, 0-9만 포함되어야 합니다.
  // lowercase : 문자열 값이 모두 소문자여야 합니다.
  // valid : 제공된 값 목록에 허용 값 모록을 추가하고 다음과 같은 경우에만 허용되는 유효한 값으로 표시
  // options ref() - 내부 참조를 만들 때 사용되는 선택적 설정
  name: Joi.string().min(2).max(10).required(),
  email: Joi.string().email().lowercase().min(4).max(20).required(),
  password: Joi.string().min(6).max(20).required(),
});

const signInSchema = Joi.object({
  email: Joi.string().email().lowercase().min(4).max(20).required(),
  password: Joi.string().min(6).max(20).required(),
});

const userValidationErrorHandler = function (req, res) {
  console.log(req.origianlUrl, 'User Validation 실패');
  let msg = '모두 소문자 그리고 숫자';
  return res.status(400).json({ message: msg });
};

const userValidatorJoi = {
  signUpValidation: async function (req, res, next) {
    try {
      const validation = await signUpSchema.validateAsync(req.body);
      next();
    } catch (error) {
      return next(new ApiError(error, 400));
    }
  },
  signInValidation: async function (req, res, next) {
    try {
        const validation = await signInSchema.validateAsync(req.body);
        next();
    } catch(error){
        return enxt(new ApiError(error, 400));
    }
  },
};

export default userValidatorJoi;
