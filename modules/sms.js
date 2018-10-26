'use strict'

const fetch = require('node-fetch')
const _ = require('lodash')
const config = require('../config/config.json').sms
const FormData = require('form-data')

function sendSMS(targetArray, message) {
    // 수신자
    let sendPerson = targetArray.reduce((acc, phone) => `${acc},${phone}`)

    let url = config.url
    let option = _.clone(config)

    delete option.url
    // delete option.testflag

    option.rphone = sendPerson
    option.msg = message

    let form = new FormData()

    for (const key in option) {
        form.append(key, option[key])
    }

    return fetch('https://sslsms.cafe24.com/sms_sender.php', {
        method: 'POST',
        body: form
    }).then(response => {
        return response.text()
    }).then(result => {
        console.log(result)
        let messages = result.split(',')

        if (messages[0] instanceof String) {
            return message[1]
        } else {
            throw Number(messages[0])
        }
    })
}

function serviceCount() {
    let params = {
        user_id: 'payot2017',
        secure: '14f7c8efbbb13da7dcf9bd778950d521',
        mode: '1'
    }

    let form = new FormData()

    for (const key in params) {
        form.append(key, params[key])
    }

    return fetch('http://sslsms.cafe24.com/sms_remain.php', {
        method: 'POST',
        body: form
    }).then(result => result.text()).then(count => Number(count))
}

module.exports = {
    send: (numbers, message) => {
        return serviceCount().then(count => {
            if (count >= numbers.length) {
                // 메시지를 보낼 수 있는 상태
                return sendSMS(numbers, message)
            } else {
                // 메시지를 보낼 수 없는 상태
                throw new Error(`남은 발송 횟수 제한으로 인한 메시지 전송 실패 (남은 횟수 : ${count})`)
            }
        })
    },
    remain: serviceCount
}