const router = require('express').Router();
const { check, validationResult } = require('express-validator/check');
const sendSMS = require('../modules/sms');
const mqtt = require('../modules/mqtt');
const { sms, userPoint } = require('../models');
const _ = require('lodash');
const moment = require('moment');

router.post('/company/:id/sms', [
    check('id', '아이디는 숫자이어야 합니다').isInt(),
    check('from.*', '휴대전화 번호를 입력해 주세요').isMobilePhone(),
    check('message', '메시지는 140Byte이상 전송할 수 없습니다').isString().isByteLength({ max: 140 }),
    check('sendType', '메시지 분류').isString().optional()
], (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(422).json({ error: errors.array() });

    sendSMS.send(req.body.from, req.body.message)
        .then(sendCount => {
            const data = {
                sendType: req.body.sendType ? req.body.sendType : '일반 전송',
                companyId: req.params.id,
                from: req.body.from.join(', '),
                count: sendCount
            }

            return sms.create(data)
        }).then(result => {
            res.json(result)
        }).catch(err => {
            res.status(500).json(err);
        });
});

module.exports = router;