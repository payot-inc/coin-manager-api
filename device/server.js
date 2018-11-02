const mqtt = require('../modules/mqtt');
const { company, machine, payments, deviceErrorLogs } = require('../models');
const _ = require('lodash');

const coinInsertRequest = `machine/+/service/cash`;

mqtt.client.subscribe(coinInsertRequest);

mqtt.client.on('message', (topic, message) => {

    console.log(topic, message.toString());
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
            include: [{ model: company, attributes: ['franchiseId'] }],
            attributes: ['id', 'mac', 'serviceAmount', 'serviceRuntimeSec', 'companyId']
        }).then(data => {
            // console.log(data)
            
            if (_.isEmpty(data)) return;
            
            return {
                mac: mac,
                companyId: data.companyId,
                franchiseId: data.company.franchiseId,
                amount: _.defaults(body[1]),
                payAt: new Date()
            }
        }).then(response => {
            payments.create(response);
        }).catch(console.log);
    }
});