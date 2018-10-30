const express = require('express');
const router = express.Router();
const _ = require('lodash');
const { user } = require('../models');
const { check, validationResult } = require('express-validator/check');

router.get('/:id', [
  check('id').toInt()
], (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array() });

  user.findOne({
    where: {
      id: req.params.id
    }
  }).then(data => {
    if (_.isEmpty(data)) res.status(204).json({});
    else res.json(data);
  }).catch(err => {
    res.status(500).json({ error: err });
  });
});

router.get('/company/:id', (req, res) => {
  user.findAll({
    where: {
      companyId: req.params.id,
    }
  }).then(result => {
    res.json(result);
  }).catch(err => {
    res.status(500).json({ error: err });
  });
});

router.post('/', [
  check('phone').isMobilePhone(),
  check('companyId').isInt(),
], (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array() });

  user.create({
    phone: req.body.phone
  }).then(data => {
    res.json(data);
  }).catch(err => {
    res.status(500).json({ error: err });
  });
})

module.exports = router;
