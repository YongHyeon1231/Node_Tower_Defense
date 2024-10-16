# Node_Tower_Defense
스파르타 코딩클럽 6기 9조 Tower_Defense websocket project

<!-- TOC -->
- [Node\_Tower\_Defense](#node_tower_defense)
  - [패키지 매니저](#패키지-매니저)
  - [Installation](#installation)
    - [Clone repository](#clone-repository)
    - [Install Dependencies](#install-dependencies)
    - [Run Release](#run-release)
    - [Run Development](#run-development)
  - [프로젝트 구조 - WebSocket과 REST API 결합 서버](#프로젝트-구조---websocket과-rest-api-결합-서버)
    - [디렉토리 구조](#디렉토리-구조)
  - [🎲 주요 기능 ](#-주요-기능-)
  - [🍻 도전 기능 ](#-도전-기능-)
  - [배포된 URL (언제 내용이 달라질지 알 수 없음)](#배포된-url-언제-내용이-달라질지-알-수-없음)
- [문서](#문서)
  - [트러블 슈팅](#트러블-슈팅)
<!-- /TOC -->

## 패키지 매니저

yarn을 사용하고 있습니다.

## Installation

### Clone repository
```bash
git clone https://github.com/YongHyeon1231/Node_Tower_Defense
```
### Install Dependencies
```bash
yarn add
```

### Run Release
```bash
yarn run start
```

### Run Development
```bash
yarn run dev
```


## 프로젝트 구조 - WebSocket과 REST API 결합 서버

이 프로젝트는 WebSocket과 HTTP REST API를 결합한 구조로 설계되었습니다. 각 주요 디렉토리와 파일들이 어떻게 구성되고 상호작용하는지를 설명합니다.

> src/socket/ 은 WebSocket 관련 처리를 위한 디렉토립니다.
>  src/rest/ 는 REST API 관련 처리를 위한 디렉토립니다.

### 디렉토리 구조

```bash
📂 NODE_TOWER_DEFENSE/
├── 📂 assets/                # 게임 또는 서버에서 사용하는 이미지, 사운드, 데이터 파일 등 정적 자산 저장
├── 📂 Docs/                  # 프로젝트 문서 파일 저장
├── 📂 logs/                  # 서버 로그 파일 저장
├── 📂 node_modules/          # 설치된 Node.js 의존성 모듈 저장
├── 📂 prisma/                # 데이터베이스 스키마와 마이그레이션 파일 저장
├── 📂 src/                   # 메인 소스 코드 디렉토리
│   ├── 📂 design-patterns/   # 디자인 패턴 관련 코드 모음
│   ├── 📂 errors/            # 에러 클래스와 에러 처리 관련 코드
│   ├── 📂 init/              # 초기화 관련 설정 및 코드
│   ├── 📂 libs/              # 라이브러리, 유틸리티 함수 저장
│   ├── 📂 managers/          # 주요 서비스 로직 관리 코드
│   ├── 📂 rest/              # HTTP REST API 관련 코드
│   │   ├── 📂 middleware/    # 요청 처리 전에 실행되는 미들웨어 모음
│   │   ├── 📂 repositories/  # 데이터베이스 접근 로직을 모아둔 저장소
│   │   ├── 📂 routes/        # API 경로 처리 로직
│   │   ├── 📂 services/      # 비즈니스 로직 처리 코드
│   └── 📂 socket/            # WebSocket 관련 코드
│       └── 📂 handlers/      # WebSocket 이벤트 핸들러
├── 📄 .env                   # 환경 변수 파일
├── 📄 .gitignore             # Git에서 제외할 파일 목록
├── 📄 .prettierrc            # Prettier 코드 스타일 설정 파일
├── 📄 app.js                 # 서버 초기화 및 엔트리 포인트
├── 📄 package.json           # 프로젝트 의존성 및 스크립트 설정 파일
├── 📄 README.md              # 프로젝트 소개 및 설명 파일
└── 📄 yarn.lock              # Yarn 패키지 관리자가 생성한 잠금 파일
```

## 🎲 주요 기능 </br>

- 회원가입 </br>
- 로그인 </br>
- 게임 시작 </br>
- 게임 종료 </br>
- 몬스터 처치시 골드, 점수 획득, 몬스터 제거 </br>
- 몬스터 스폰 </br>
- 스테이지 이동 </br>
- 최초 타워 생성 </br>
- 타워 구매</br>
- 타워 판매 </br>
- 타워 업그레이드</br>

## 🍻 도전 기능 </br>

- 스테이지 별 몬스터 종류
- 타워 판매
- 타워 종류
- 타워 업그레이드
- 보물 고블린

## 배포된 URL (언제 내용이 달라질지 알 수 없음)
해당 URL은 개인 NAS 서버에 인증서 없이 역방향 프록시로 게시한 서버입니다. 
그래서 https로 접근시 페이지 로드가 불가능하며, 만약 이미 시도 후 이 글을 봤다면 시크릿 모드 혹은 캐시 삭제 후 재시도 하시면됩니다.

```url
http://sparta.positivenerd.duckdns.org/
```
-------

# 문서
- 프리스마 사용 중 문제 발생을 최소화 하기 위해 [Prisma 협업 문서](./Docs/prisma.md)를 읽어주세요.
- REST API 작업 요령은 이 [문서](./Docs/rest.md)를 참고해주세요.
- Socket 요청 핸들링 작업 요령은 이 [문서](./Docs/socket.md)를 참고해주세요.
- 데이터베이스의 사용 방법을 고려하고 싶다면 이 [문서](./Docs/database.md)를 참고해주세요.

## 트러블 슈팅
- [redis는 왜 날 괴롭히나](./Docs/Troubleshootings/redisDeleteData.md)

----


  ![사실 잘 모르고스](./Docs/Images/argous.png)
