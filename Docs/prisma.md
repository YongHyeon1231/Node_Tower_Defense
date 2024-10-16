# Prisma를 이용한 협업 가이드
Prisma를 사용하여 팀과 협업할 때 필요한 기본적인 과정들을 정리한 가이드입니다.

<!-- TOC -->
- [Prisma를 이용한 협업 가이드](#prisma를-이용한-협업-가이드)
  - [1. 함부로 마이그레이션 하지 말 것](#1-함부로-마이그레이션-하지-말-것)
  - [2. 마이그레이션 받아오기](#2-마이그레이션-받아오기)

<!-- /TOC -->

## 1. 함부로 마이그레이션 하지 말 것

마이그레이션 하는 방법은 다음과 같습니다. 
마이그레이션을 할 경우 스키마의 관계나 구조가 크게 변경되었을시 기존 데이터가 모두 소거되는 문제가 있으니 함부로 마이그레이션 하지 말고 팀과 소통 후 결정할 수 있도록 합시다.
```bash
npx prisma migrate dev --name [마이그레이션_이름]
```


## 2. 마이그레이션 받아오기
아래 명령어를 통해 최신 스키마 상태로 강제로 받아올 수 있습니다.
branchㄹ를 이용해 별도로 분리할 수 있다면 더 좋을 수도 있겠지만 지금은 이 방법만으로 충분할 것 같습니다.

``` bash
npx prisma db pull --force

```
