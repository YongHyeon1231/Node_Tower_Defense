# REST API 작성 요령
<!-- TOC -->
- [REST API 작성 요령](#rest-api-작성-요령)
  - [Layer](#layer)
  - [Middleware](#middleware)
  - [Routes](#routes)
    - [작업 요령](#작업-요령)
      - [1. rest/routes/{domain}.route.js 에 관련 api를 명세합니다.](#1-restroutesdomainroutejs-에-관련-api를-명세합니다)
      - [2. rest/routes/routes.js에 allRoutes에 스프레드하여 등록합니다.](#2-restroutesroutesjs에-allroutes에-스프레드하여-등록합니다)
      - [3. routes.js에서 명세된 모든 api에 대해 미들웨어 및 필요 파라미터를 자동으로 등록합니다.](#3-routesjs에서-명세된-모든-api에-대해-미들웨어-및-필요-파라미터를-자동으로-등록합니다)
  - [Services](#services)
    - [작업 요령](#작업-요령-1)
      - [1. {domain}.service.js 로 파일을 작성합니다.](#1-domainservicejs-로-파일을-작성합니다)
      - [2. 파라미터는 객체로 전달 받습니다.](#2-파라미터는-객체로-전달-받습니다)
      - [3. 리턴 할 때도 객체로 전달합니다.](#3-리턴-할-때도-객체로-전달합니다)
  - [Repositories](#repositories)
    - [작업 요령](#작업-요령-2)
      - [1. {domain}.repository.js 로 파일을 작성합니다.](#1-domainrepositoryjs-로-파일을-작성합니다)
      - [2. db와 상호작용하는 코드를 작성하고 결과를 반환합니다.](#2-db와-상호작용하는-코드를-작성하고-결과를-반환합니다)

<!-- /TOC -->
## Layer

- Routes : api를 명세하고 어떤 서비스와 연결되었는지 명세합니다.
- Services : 비즈니스 로직을 담당합나다.
- Repositories : db와의 상호작용을 담당합니다.

## Middleware

미들웨어는 두 종류가 있습니다.

1. token : jwt 토큰 인증을 시도하는지 검사합니다. 토큰이 포함되었을 경우 인증을 시도하며, req.user에 해당 유저 정보를 기입합니다.
2. auth : 인증을 필요로 하는 api에 우선적으로 동작하여 token 인증을 했는지 검사합니다. req.user가 있는지로 검사하면 됩니다.

------

## Routes

### 작업 요령

#### 1. rest/routes/{domain}.route.js 에 관련 api를 명세합니다.

반드시 포함되어야 하는 정보는 다음과 같습니다.

1. method : 어떤 메소드로 수신할지
2. url : api 경로
3. action : 비즈니스 로직

옵션 정보

1. authRequired : true로 인식될 모든 값. 인증을 반드시 해야 하도록 미들웨어를 등록합니다.

```js
//users.route.js
import { login, signup, enhanceAthletes, sellAthlete } from '../services/users-service.js';
const routes = [
  {
    method: 'post',
    url: '/users/signup',
    action: signup,
  },
  {
    method: 'post',
    url: '/users/login',
    action: login,
  },
  {
    method: 'post',
    url: '/users/athletes/training',
    action: enhanceAthletes,
    authRequired: true,
  },
  {
    method: 'post',
    url: '/users/athletes/sell',
    action: sellAthlete,
    authRequired: true,
  },
];

export default routes;

```


#### 2. rest/routes/routes.js에 allRoutes에 스프레드하여 등록합니다.

```js
//routes.js
const allRoutes = [
  ...userRoutes,
  // 다른 라우트 추가 가능
];

```

#### 3. routes.js에서 명세된 모든 api에 대해 미들웨어 및 필요 파라미터를 자동으로 등록합니다.


```js
//routes.js
import Utils from '../libs/utils.js';
import userRoutes from './users.route.js';
import { tokenVerify } from '../middleware/token-middleware.js';
import { authenticateToken } from '../middleware/auth-middleware.js';

const allRoutes = [
  ...userRoutes,
  // 다른 라우트 추가 가능
];

// 파라미터 및 미들웨어 자동 설정
allRoutes.forEach((route) => {
  route.requiredParams = Utils.getFunctionParams(route.action);
  route.middleware = [tokenVerify];

  if (route.authRequired) {
    route.middleware.push(authenticateToken);
  }
});

export default allRoutes;

```

-----

## Services

레이어 아키텍처의 컨트롤 + 서비스 레이어를 결합한 비즈니스 로직 처리단입니다.

### 작업 요령


#### 1. {domain}.service.js 로 파일을 작성합니다.

처리할 api 단위로 함수로 작성합니다.

#### 2. 파라미터는 객체로 전달 받습니다.

```js
//users.service.js
import { createUser } from '../repositories/users.repository.js';

export const signup = async ({email, name, password}) => {
 //회원가입
...
 await createUser(email, name, passowrd);

...
}

```


#### 3. 리턴 할 때도 객체로 전달합니다.

```js
//users.service.js
import ApiError from '../../errors/api-error.js';
import { createUser } from '../repositories/users.repository.js';

export const signup = async ({email, name, password}) => {
 //회원가입
...
try{
 await createUser(email, name, passowrd);
}catch(error){
    throw new ApiError('회원 가입 중 문제가 발생 했습니다.', 500);
}

return;
}

```

다음 에러 throw는 status코드와 전달한 메세지입니다.

>  throw new ApiError('회원 가입 중 문제가 발생 했습니다.', 500);


만약 정상적인 처리 후 별도로 전달할 데이터가 없으면 아무것도 return 하지 않아도 됩니다.

> return;


아이템 목록을 반환한다고 한다면 다음과 같이 해볼 수 있습니다.

> return { items };

------------------

## Repositories

DB와 상호작용하는 레이어입니다.

### 작업 요령

#### 1. {domain}.repository.js 로 파일을 작성합니다.
> users.repository.js

#### 2. db와 상호작용하는 코드를 작성하고 결과를 반환합니다.

```js
//
import prisma from '../../managers/prisma.manager.js';

export const createUser = async ({ email, password, name }) => {
  return prisma.player.create({
    data: {
      email,
      password,
      name,
    },
  });
  
};
```