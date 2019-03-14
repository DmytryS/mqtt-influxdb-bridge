# MQTT-InfluxDB-bridge

[![Build Status](https://travis-ci.com/DmytryS/mqtt-influxdb-bridge.svg?branch=master)](https://travis-ci.com/DmytryS/mqtt-influxdb-bridge.svg?branch=master)

Application listens for MQTT-broker and stores messages to InfluxDB.

    value = 31
    topic = kiev/device1/temperature

is sent to InfluxDB with values

    measurement      = temperature
    value            = 31
    tag:location     = kiev
    tag:device       = device1

## Running

Script needs three environment variables

- `BROKER_ADR` - connection string to MQTT-broker
- `DB_ADR` - connection string to InfluxDB
- `DB` - InfluxDB database name

Eexample:

    env BROKER_ADR=tcp://localhost:1883 DB_ADR=http://localhost:8086 DB=mqtt npm start

## Running with Docker

    docker run -e BROKER_ADR=tcp://mqtt-broker:1883 -e DB_ADR=http://influxdb:8086 -e DB=mqtt loginkr/mqtt-influxdb-bridge
