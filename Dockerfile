# 베이스 이미지로 Node.js 사용
FROM node:22.8.0-slim

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# 패키지 최신화 및 openssl 설치
RUN apt-get update -y && apt-get upgrade -y && apt-get install -y openssl

# 패키지 매니저를 yarn으로 설정하고, package.json 및 yarn.lock 파일을 복사
COPY package.json yarn.lock ./

# 패키지 설치
RUN yarn install --frozen-lockfile

# 소스 코드 및 Prisma 스키마 복사
COPY . .

# Prisma 클라이언트 생성
RUN yarn prisma generate

# 포트 설정
EXPOSE $SERVER_PORT

# 앱 실행
CMD ["yarn", "start"]
