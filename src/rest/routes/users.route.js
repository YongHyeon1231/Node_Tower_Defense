import { signUp, signIn, changeName } from '../services/users.service.js';
import userValidatorJoi from '../middleware/validators/userValidator.middleware.js';

const allRoutes = [
  {
    url: '/signUp',
    method: 'post',
    action: signUp,
    //authRequired: false,
    validator: userValidatorJoi.signUpValidation,
  },
  {
    url: '/signIn',
    method: 'post',
    action: signIn,
    //authRequired: false,
    validator: userValidatorJoi.signInValidation,
  },
  {
    url: '/changeName',
    method: 'patch',
    action: changeName,
    authRequired: true,
    validator: userValidatorJoi.nameValidation,
  },
];

export default allRoutes;
