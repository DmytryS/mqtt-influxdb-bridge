import mqtt from 'mqtt';
import { InfluxDB } from 'influx';
import { logger } from './lib/index.js';

const { BROKER_ADR, DB_ADR, DB } = process.env

export default class Bridge {
  constructor() {
    this._mqttClient = mqtt.connect(BROKER_ADR);
    this._mqttClient.on('error', this._onMqttError.bind(this));
    this._mqttClient.on('connect', this._onConnectBroker.bind(this));
    this._mqttClient.on('close', this._onDisconnectBroker.bind(this));

    logger.info(`Connecting to InfluxDB host ${DB_ADR}`);
    this._influx = new InfluxDB(DB_ADR);
    this._influx.ping(5000).then(this._influxDbPing);
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
    logger.info(`Connected to mqtt broker: ${BROKER_ADR}`);
  }

  _onDisconnectBroker() {
    logger.info(`Disconnected from mqtt broker: ${BROKER_ADR}`);
  }

  async _saveToDB(topic, message) {
    try {
      const [location, device, measurement] = topic.split('/');
      const messageString = message.toString();
      const fields = {};

      // eslint-disable-next-line
      if (isNaN(messageString)) {
        fields.string = messageString;
      } else {
        fields.value = parseFloat(messageString);
      }

      await this._influx.writePoints(
        [
          {
            measurement,
            tags: {
              location,
              device,
            },
            fields,
          },
        ],
        {
          database: DB,
          precision: 's',
        },
      );
    } catch (error) {
      logger.error('An error occured during saving data to DB', error);
    }
  }

  _onMqttError(error) {
    if (error) {
      logger.error('MQTT error:', error);
    }
  }

  async _checkIfDbExists() {
    const databaseNames = await this._influx.getDatabaseNames();

    if (!databaseNames.includes(DB)) {
      logger.info(`Creating InfluxDb database ${DB}`);

      return this._influx.createDatabase(DB);
    }

    return true;
  }

  _influxDbPing(hosts) {
    hosts.forEach((host) => {
      if (!host.online) {
        logger.error(`${host.url.host} is offline`);
        logger.info(`Reconnecting influxDB host ${DB_ADR}`);
        this._influx = new InfluxDB(DB_ADR);
        this._influx.ping(5000).then(this._influxDbPing);
      }
    });
  }
}
