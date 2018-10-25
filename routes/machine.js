const router = require('express').Router();
const { machine } = require('../models');

// 장치 정보 가져오기
router.get('/:id', (req, res) => {
    machine.findOne({
        where: {
            id: req.params.id
        },
        attributes: { exclude: ['updatedAt', 'deletedAt'] }
    }).then(result => {
        if (_.isEmpty(result)) res.status(204).json();
        else res.json(result)
    }).catch(err => {
        res.status(500).json({ error: err });
    });
});

module.exports = router;