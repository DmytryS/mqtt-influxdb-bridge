import mqtt from 'mqtt';
import influx from 'influx';

export class Bridge {
  constructor() {
    this._mqttClient = mqtt.connect(process.env.BROKER_ADR);
    this._influx = new influx.InfluxDB(process.env.DB_ADR);
  }

  async start() {
    await this._connectToBroker();
    await this._checkIfDbExists();

    this._mqttClient.on('error', this._onMqttError);
    this._mqttClient.subscribe('#', this._onMqttError);
    this._mqttClient.on('message', this._saveToDB.bind(this));
  }

  _connectToBroker() {
    return new Promise(resolve => this._mqttClient.on('connect', resolve));
  }

  _saveToDB(topic, message) {
    try {
    console.log(topic, message.toString());

    const [ location, device, measurement ] = topic.split('/');

    this._influx.writePoints([
      {
        measurement,
        tags: {
          location,
          device
        },
        fields: {
          value: parseFloat(message.toString())
        }
      }
    ],
    {
        database: process.env.DB,
        precision: 's',
    });
    } catch (error) {
      console.log(`An error occured during saving data to DB`, error);
    }
  }

  _onMqttError(error) {
    console.log('MQTT error:', error);
  }

  async _checkIfDbExists() {
    const databaseNames= await this._influx.getDatabaseNames();

    if (!databaseNames.includes(process.env.DB)) {
      console.log(`Creating influxdb database ${process.env.DB}`);

      return this._influx.createDatabase(process.env.DB);
    }
  }
}

export default new Bridge();
