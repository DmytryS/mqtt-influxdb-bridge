"use strict";

var _bridge = _interopRequireDefault(require("./bridge"));

var _lib = require("./lib");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const appLogger = _lib.logger.getLogger('Bridge');

const bridge = new _bridge.default();
bridge.connect();
process.on('uncaughtException', err => {
  appLogger.error('Unhandled exception', err);
});
process.on('unhandledRejection', err => {
  appLogger.error('Unhandled rejection', err);
});
process.on('SIGTERM', async () => {
  appLogger.info('Received SIGTERM, going to shutdown server.');
  await bridge.disconnect();
  appLogger.info('Exited... Buy :)');
});
//# sourceMappingURL=app.js.map