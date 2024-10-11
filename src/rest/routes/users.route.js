<<<<<<< HEAD
import { signup } from '../services/users.service.js';
=======
import { signUp, signIn } from '../services/users.service.js';
>>>>>>> PYH
import userValidatorJoi from '../middleware/validators/userValidator.middleware.js';

const allRoutes = [
  {
<<<<<<< HEAD
    url: '/users',
    method: 'post',
    action: signup,
    //authRequired: false,
    validator: userValidatorJoi.signUpValidation,
  },
=======
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
>>>>>>> PYH
];

export default allRoutes;
