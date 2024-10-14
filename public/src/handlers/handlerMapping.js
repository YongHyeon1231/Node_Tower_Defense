import {
  connectHandler,
  disconnectHandler,
  handlerNotFoundHandler,
  versionMismatchHandler,
} from './connection.handler.js';
import { stageSetup, moveStage, updatedRank } from './game.handler.js';
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
    event: 'updatedRank',
    action: updatedRank,
  },
  {
    event: 'handler_not_found',
    action: handlerNotFoundHandler,
  },
];

export default handlers;
