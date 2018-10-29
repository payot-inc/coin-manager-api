const mqtt = require('../modules/mqtt');
const { machine, payments, deviceErrorLogs } = require('../models');
const _ = require('lodash');

const coinInsertRequest = `machine/+/service/cash`;

mqtt.client.subscribe(coinInsertRequest, (topic, message) => {
    const mac = topic.split('/')[1];
    const body = message.toString().split(' ');

    if (body[0] !== '000') {
        deviceErrorLogs.create({
            mac: mac,
            code: body[0],
            reason: body[2]
        });
    } else {
        machine.findOne({
            where: {
                mac: mac
            },
            attributes: ['id', 'mac', 'serviceAmmount', 'serviceRuntimeSec', 'companyId', 'franchiseId']
        }).then(data => {
            if (_.isEmpty(data)) return;
            return payments.create({
                mac: mac,
                companyId: data.companyId,
                franchiseId: data.franchiseId,
                amount: _.defaults(body[1])
            });
        });
    }
})