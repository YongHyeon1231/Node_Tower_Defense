import { signUp, signIn } from '../services/users.service.js';
import userValidatorJoi from '../middleware/validators/userValidator.middleware.js';

const allRoutes = [
  {
    url: '/signup',
    method: 'post',
    action: signUp,
    //authRequired: false,
    validator: userValidatorJoi.signUpValidation,
  },
  {
    url: '/signin',
    method: 'post',
    action: signIn,
    //authRequired: false,
    validator: userValidatorJoi.signInValidation,
  },
];

export default allRoutes;
