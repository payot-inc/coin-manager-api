const router = require('express').Router();
const _ = require('lodash');
const moment = require('moment');
const { payments, machine } = require('../models');
const { check, validationResult } = require('express-validator/check');

router.get('/company/:id', [
    check('id').isInt(),
    check('start').custom(value => moment(value).isValid()).optional(),
    check('end').custom(value => moment(value).isValid()).optional(),
], (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(422).json({ error: errors.array() });

    const startDate = moment(req.query.start).toDate();
    const endDate = moment(req.query.end).toDate();

    payments.findAll({
        where: {
            companyId: req.params.id,
            payAt: {
                between: [startDate, endDate]
            }
        }
    }).then(data => {
        res.json(data);
    }).catch(err => {
        res.status(500).json({ error: err });
    });
});

router.get('/franchise/:id', [
    check('id').isInt(),
    check('start').custom(value => moment(value).isValid()).optional(),
    check('end').custom(value => moment(value).isValid()).optional(),
], (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(422).json({ error: errors.array() });

    const startDate = moment(req.query.start).toDate();
    const endDate = moment(req.query.end).toDate();

    payments.findAll({
        where: {
            franchiseId: req.params.id,
            payAt: {
                between: [startDate, endDate]
            }
        }
    }).then(data => {
        res.json(data);
    }).catch(err => {
        res.status(500).json({ error: err });
    });
});

router.get('/machine/:id', [
    check('id').isInt(),
    check('start').custom(value => moment(value).isValid()).optional(),
    check('end').custom(value => moment(value).isValid()).optional(),
], (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(422).json({ error: errors.array() });

    const startDate = moment(req.query.start).toDate();
    const endDate = moment(req.query.end).toDate();

    machine.findOne({
        where: {
            id: req.params.id
        },
        attributes: ['mac']
    }).then(mac => {
        if (_.isEmpty(mac)) return;
        return payments.findAll({
            where: {
                mac: mac,
                payAt: {
                    between: [startDate, endDate]
                }
            }
        }).then(data => {
            res.json(data);
        }).catch(err => {
            res.status(500).json({ error: err });
        });
    });
});

module.exports = router;