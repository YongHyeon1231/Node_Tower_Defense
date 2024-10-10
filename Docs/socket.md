# 소켓 핸들링 작업 메뉴얼
소켓 핸들링 모듈을 작성할 때 참고할 메뉴얼입니다.

<!-- TOC -->
<!-- /TOC -->




## Result
핸들러에서 요청한 클라이언트에게 반송하기위한 데이터 규격은 다음과 같습니다.

```json
response: {
 message: "your-message",
 event: "your-event",
 data: {}
}
```

## BroadCast
웹 소켓에 연결된 모든 클라이언트에게 메세지를 전송하는 기능입니다.
핸들러에서는 다음과 같은 메세지를 포함하면 됩니다.
그러면 핸들러를 호출한 곳에서 자동으로 해당 이벤트로 데이터를 보냅니다.

```json

response: {
 message: "your-message",
 event: "your-event",
 data: {},
 broadcast:{ //브로드 캐스트 정보를 별도로 첨부함
    event: "your-event",
    data: {}
}
}

```



## 작업 요령

### 1. socket/handlers/{domain}.handler.js 를 작성합니다.

> game.handler.js

### 2. 해당 파일에 핸들링 함수를 작성합니다.

```js
//socket/handlers/game.handler.js
import { getGameAssets } from '../init/assets.js';
import { clearStage, getStage, setStage } from '../models/stage.model.js';
import { getValidScore } from './helper.js';
import { getFirstPlace, updateScoreAndDetectFirstPlaceChange } from '../models/scoreborad.model.js';
import { getUser, updateHiDistance, updateHiScore } from '../models/user.model.js';
export const gameStart = (uuid, payload) => {
  const { stages } = getGameAssets();
  const currentTime = new Date().toISOString();
  clearStage(uuid);
  setStage(uuid, stages.data[0].id, currentTime);

  return {
    event: 'stageResponse',
    status: 'success',
    timestamp: currentTime,
    stageId: stages.data[0].id,
  };
};

export const gameEnd = async (uuid, payload) => {
  const { currentStage, currentScore, currentDistance } = payload;
  const event = 'gameEnd';
  let status = 'success';
  let message = undefined;
  let stage = await getStage(uuid);
  let maxScore = 0;
  let broadcast = undefined;
  let { stages } = getGameAssets();
  stages = stages.data;
  stages.forEach((stage, index) => {
    maxScore += getValidScore(stage.id);
  });
  if (!stage) {
    status = 'fail';
    message = 'No stages found for user';
  } else if (stage.id !== currentStage) {
    status = 'fail';
    message = 'Current Stage mismatch';
  } else if (maxScore < currentScore) {
    status = 'fail';
    message = 'Impossible score.';
  } else {
    const [updatedRank, updatedHiScore, updatedHiDistance] = await Promise.all([
      updateScoreAndDetectFirstPlaceChange(uuid, currentScore),
      updateHiScore(uuid, currentScore),
      updateHiDistance(uuid, currentDistance),
    ]);

    if (updatedRank) {
      let firsUser = await getUser(updatedRank);
      firsUser.socketId = undefined;
      firsUser.uuid = undefined;
      broadcast = {
        event: 'updatedRank',
        data: { firsUser },
      };
    }
  }

  clearStage(uuid);

  return { status: 'success', message: 'Game ended', broadcast };
};

```


