"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mqtt = _interopRequireDefault(require("mqtt"));

var _influx = require("influx");

var _lib = require("./lib");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Bridge {
  constructor() {
    this._logger = _lib.logger.getLogger('Bridge');
    this._mqttClient = _mqtt.default.connect(process.env.BROKER_ADR);

    this._mqttClient.on('error', this._onMqttError.bind(this));

    this._mqttClient.on('connect', this._onConnectBroker.bind(this));

    this._mqttClient.on('close', this._onDisconnectBroker.bind(this));

    this._influx = new _influx.InfluxDB(process.env.DB_ADR);
  }

  async connect() {
    await this._checkIfDbExists();

    this._mqttClient.subscribe('#', this._onMqttError.bind(this));

    this._mqttClient.on('message', this._saveToDB.bind(this));
  }

  async disconnect() {
    await this._mqttClient.end();
    this._influx = false;
  }

  _onConnectBroker() {
    this._logger.info(`Connected to mqtt broker: ${process.env.BROKER_ADR}`);
  }

  _onDisconnectBroker() {
    this._logger.info(`Disconnected from mqtt broker: ${process.env.BROKER_ADR}`);
  }

  _saveToDB(topic, message) {
    try {
      const [location, device, measurement] = topic.split('/');
      const messageString = message.toString();
      const fields = {};

      if (Number.isNaN(messageString)) {
        fields.string = messageString;
      } else {
        fields.value = parseFloat(messageString);
      }

      this._influx.writePoints([{
        measurement,
        tags: {
          location,
          device
        },
        fields
      }], {
        database: process.env.DB,
        precision: 's'
      });
    } catch (error) {
      this._logger.error('An error occured during saving data to DB', error);
    }
  }

  _onMqttError(error) {
    if (error) {
      this._logger.error('MQTT error:', error);
    }
  }

  async _checkIfDbExists() {
    const databaseNames = await this._influx.getDatabaseNames();

    if (!databaseNames.includes(process.env.DB)) {
      this._logger.info(`Creating InfluxDb database ${process.env.DB}`);

      return this._influx.createDatabase(process.env.DB);
    }

    return true;
  }

}

exports.default = Bridge;
//# sourceMappingURL=bridge.js.map