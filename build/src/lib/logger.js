"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _log4js = _interopRequireDefault(require("log4js"));

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const pathToFile = `${process.cwd()}/logs`;

if (!_fs.default.existsSync(pathToFile)) {
  _fs.default.mkdirSync(pathToFile);
}

const appenders = {
  file: {
    type: 'file',
    filename: `${process.cwd()}/logs/${process.env.NODE_ENV}-app.log`,
    timezoneOffset: 0
  }
};
const categories = {
  default: {
    appenders: ['file'],
    level: 'info'
  }
};

if (process.env.NODE_ENV !== '') {
  // production
  appenders.console = {
    type: 'console'
  };
  categories.default.appenders.push('console');
  categories.default.level = 'debug';
}

_log4js.default.configure({
  categories,
  appenders
});

var _default = _log4js.default;
exports.default = _default;
//# sourceMappingURL=logger.js.map