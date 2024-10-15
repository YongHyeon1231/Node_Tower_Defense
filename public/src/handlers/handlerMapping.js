import {
  connectHandler,
  disconnectHandler,
  handlerNotFoundHandler,
  versionMismatchHandler,
} from './connection.handler.js';
import { stageSetup, moveStage, gameStartHandler } from './game.handler.js';
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
    event: 'stageResponse',
    action: stageSetup,
  },
  {
    event: 'moveStage',
    action: moveStage,
  },
  {
    event: 'handler_not_found',
    action: handlerNotFoundHandler,
  },
  {
    event: 'game_start',
    action: gameStartHandler,
  },
];

export default handlers;
