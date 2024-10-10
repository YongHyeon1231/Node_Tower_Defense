
# Redis와 Prisma 직접 사용 및 DatabaseServiceManager 활용법

이 문서는 Redis나 Prisma를 직접적으로 사용해야 할 때와, DatabaseServiceManager를 사용하는 것이 유리한 상황을 설명하고, DatabaseServiceManager의 활용 예제를 제공합니다.

<!-- TOC -->
- [Redis와 Prisma 직접 사용 및 DatabaseServiceManager 활용법](#redis와-prisma-직접-사용-및-databaseservicemanager-활용법)
  - [1. Redis, Prisma 직접 사용 vs DatabaseServiceManager](#1-redis-prisma-직접-사용-vs-databaseservicemanager)
    - [Redis 직접 사용](#redis-직접-사용)
    - [Prisma 직접 사용](#prisma-직접-사용)
    - [DatabaseServiceManager 사용이 유리한 상황](#databaseservicemanager-사용이-유리한-상황)
  - [2. DatabaseServiceManager 활용법](#2-databaseservicemanager-활용법)
    - [데이터 조회 및 캐싱 예시](#데이터-조회-및-캐싱-예시)
    - [데이터 변경 후 캐시 무효화 예시](#데이터-변경-후-캐시-무효화-예시)
    - [트랜잭션 처리 및 캐시 무효화 예시](#트랜잭션-처리-및-캐시-무효화-예시)
    - [캐시 TTL 갱신 예시](#캐시-ttl-갱신-예시)
  - [3. 언제 DatabaseServiceManager를 사용해야 하는가?](#3-언제-databaseservicemanager를-사용해야-하는가)

<!-- /TOC -->


## 1. Redis, Prisma 직접 사용 vs DatabaseServiceManager

### Redis 직접 사용
Redis를 직접 사용하는 것이 유리한 상황은 주로 다음과 같습니다:
- 캐시가 아닌, 세션 정보나 임시 데이터를 저장할 때.
- 특정 키의 TTL(만료 시간)을 관리해야 할 때.
- Redis에 저장된 데이터를 제어하거나 분석하는 경우.

**Redis 직접 사용 예시:**
```javascript
// 세션 데이터를 Redis에 저장
await redisManager.set('session_user_123', JSON.stringify(userData), 3600); // TTL 3600초
// TTL 갱신
await redisManager.expire('session_user_123', 7200); // TTL 7200초로 갱신
```

### Prisma 직접 사용
Prisma를 직접 사용하는 것이 유리한 상황은 다음과 같습니다:
- 캐시가 필요하지 않고, 실시간 데이터베이스 트랜잭션이 중요한 경우.
- 매우 복잡한 쿼리를 실행하거나 다중 테이블 간의 관계를 다룰 때.
- 트랜잭션 내에서 여러 작업을 처리해야 할 때.

**Prisma 직접 사용 예시:**
```javascript
// Prisma를 이용한 트랜잭션 처리
const result = await prisma.$transaction([
  prisma.user.update({ where: { id: 1 }, data: { name: 'New Name' } }),
  prisma.post.create({ data: { title: 'New Post', userId: 1 } })
]);
```

### DatabaseServiceManager 사용이 유리한 상황
DatabaseServiceManager는 캐싱이 필요한 데이터베이스 조회 작업에 매우 유리합니다. 주로 다음과 같은 상황에서 유리합니다:
- 반복적으로 호출되는 데이터 조회 작업에서 캐싱을 통해 성능을 개선해야 할 때.
- 대용량 데이터에서 페이지네이션 처리를 할 때.
- 데이터베이스에 변경이 일어날 때 관련 캐시를 무효화해야 할 때.

## 2. DatabaseServiceManager 활용법

DatabaseServiceManager는 Redis와 Prisma를 결합하여 캐싱과 데이터베이스 조회를 통합적으로 관리하는 도구입니다.

### 데이터 조회 및 캐싱 예시

다수의 사용자 데이터를 조회할 때, 데이터베이스 조회 결과를 Redis에 캐싱하여 성능을 개선할 수 있습니다.

```javascript
// 사용자의 데이터를 조회하고 캐싱
const users = await dbServiceManager.findMany('User', {
  where: { isActive: true },
  select: { id: true, name: true, email: true }
}, 3600);  // 3600초 동안 캐시
console.log(users);
```

### 데이터 변경 후 캐시 무효화 예시

새로운 데이터를 생성하거나 업데이트할 때는 관련 캐시를 무효화하여 최신 데이터가 반영되도록 할 수 있습니다.

```javascript
// 사용자 데이터를 생성하고 관련 캐시를 무효화
await dbServiceManager.createData('User', {
  email: 'newuser@example.com',
  password: 'hashedpassword',
  name: 'New User'
}, ['user_list_cache_key']);
```

### 트랜잭션 처리 및 캐시 무효화 예시

데이터베이스의 여러 작업을 트랜잭션으로 처리하고, 작업 완료 후 관련 캐시를 무효화할 수 있습니다.

```javascript
// 트랜잭션 실행 후 캐시 무효화
const queries = [
  prisma.user.update({ where: { id: 1 }, data: { name: 'Updated Name' } }),
  prisma.post.create({ data: { title: 'Post Title', userId: 1 } })
];
await dbServiceManager.executeTransaction(queries, ['user_1_cache_key', 'post_list_cache_key']);
```

### 캐시 TTL 갱신 예시

캐시에 저장된 데이터의 TTL(유효 기간)을 갱신할 때는 `refreshTTL` 메소드를 사용할 수 있습니다.

```javascript
// 캐시의 TTL 갱신
await dbServiceManager.refreshTTL('user_list_cache_key', 7200);  // TTL 7200초로 연장
```

## 3. 언제 DatabaseServiceManager를 사용해야 하는가?

- **캐싱을 통해 성능을 개선해야 하는 경우**: 자주 조회되는 데이터는 캐싱을 통해 데이터베이스 부하를 줄일 수 있습니다.
- **데이터 일관성을 유지해야 하는 경우**: 데이터 변경 시 관련 캐시를 무효화하는 로직을 일관되게 처리할 수 있습니다.
- **페이지네이션이 필요한 경우**: 대용량 데이터에서 효율적인 페이지네이션 처리를 위해 캐시를 사용할 수 있습니다.
- **데이터베이스 트랜잭션이 필요한 경우**: 트랜잭션 처리 후 관련 캐시를 무효화하여 데이터 일관성을 보장할 수 있습니다.

DatabaseServiceManager를 활용하면 Redis와 Prisma를 결합하여 보다 효율적인 데이터베이스 조회 및 캐싱 전략을 구현할 수 있습니다.
