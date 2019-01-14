import mqtt from 'mqtt';
import { InfluxDB } from 'influx';

export class Bridge {
  constructor() {
    this._mqttClient = mqtt.connect(process.env.BROKER_ADR);
    this._mqttClient.on('error', this._onMqttError);
    this._mqttClient.on('connect', this._onConnectBroker);
    this._mqttClient.on('close', this._onDisconnectBroker);
    
    this._influx = new InfluxDB(process.env.DB_ADR);
  }

  async start() {
    await this._checkIfDbExists();

    this._mqttClient.subscribe('#', this._onMqttError);
    this._mqttClient.on('message', this._saveToDB.bind(this));
  }

  _onConnectBroker() {
    console.log(`Connected to mqtt broker ${process.env.BROKER_ADR}`);
  }

  _onDisconnectBroker() {
    console.log(`Disconnected from mqtt broker ${process.env.BROKER_ADR}`);
  }

  _saveToDB(topic, message) {
    try {
      const [ location, device, measurement ] = topic.split('/');
      const messageString = message.toString();
      const fields = {};

      if (isNaN(messageString)) {
        fields.string = messageString;
      } else {
        fields.value = parseFloat(messageString);
      }

      this._influx.writePoints([
        {
          measurement,
          tags: {
            location,
            device
          },
          fields
        }
      ],
      {
          database: process.env.DB,
          precision: 's',
      });
    }
    catch (error) {
      console.log(`An error occured during saving data to DB`, error);
    }
  }

  _onMqttError(error) {
    if (error) {
      console.log('MQTT error:', error);
    }
  }

  async _checkIfDbExists() {
    const databaseNames= await this._influx.getDatabaseNames();

    if (!databaseNames.includes(process.env.DB)) {
      console.log(`Creating InfluxDb database ${process.env.DB}`);

      return this._influx.createDatabase(process.env.DB);
    }
  }
}

export default new Bridge();
