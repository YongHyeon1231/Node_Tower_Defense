import { signup } from '../services/users.service.js';
import userValidatorJoi from '../middleware/validators/userValidator.middleware.js';

const allRoutes = [
  {
    url: '/users',
    method: 'post',
    action: signup,
    //authRequired: false,
    validator: userValidatorJoi.signUpValidation,
  },
];

export default allRoutes;
