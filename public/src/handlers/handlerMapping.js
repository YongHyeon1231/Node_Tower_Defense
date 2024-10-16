import {
  connectHandler,
  disconnectHandler,
  handlerNotFoundHandler,
  versionMismatchHandler,
} from './connection.handler.js';
import { gameStartHandler, gameEndHandler } from './game.handler.js';
import { moveStageHandler } from './stage.handler.js';
import { monsterSpawnHandler, monsterKillerHandler } from './monster.handler.js';
const handlers = [
  {
    event: 'connection',
    action: connectHandler,
  },
  {
    event: 'version_mismatch',
    action: versionMismatchHandler,
  },
  {
    event: 'move_stage',
    action: moveStageHandler,
  },
  {
    event: 'handler_not_found',
    action: handlerNotFoundHandler,
  },
  {
    event: 'game_start',
    action: gameStartHandler,
  },
  {
    event: 'game_end',
    action: gameEndHandler,
  },
  {
    event: 'disconnect',
    action: disconnectHandler,
  },
  {
    event: 'monsterSpawn',
    action: monsterSpawnHandler,
  },
  {
    event: 'monsterKill',
    action: monsterKillerHandler,
  },
];

export default handlers;
