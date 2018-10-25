const router = require('express').Router();
const _ = require('lodash');
const moment = require('moment');
const password = require('../modules/password');
const { company, owner } = require('../models');
const { check, validationResult } = require('express-validator/check');

// 업체 조회
router.get('/:id', [
    check('id', '아이디는 숫자이어야 합니다').toInt()
], (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(422).json({ error: errors.array() });

    company.findOne({
        where: {
            id: req.params.id
        },
        include: [
            { model: owner }
        ],
        attributes: { exclude: ['hash', 'salt', 'updatedAt', 'deletedAt'] }
    }).then(result => {
        if (result == null || result.length == 0) res.json({});
        else res.json(result);
    }).catch(err => {
        res.status(500).json({ error: err });
    });
});

// 업체 생성
router.post('/', [
    check('email', '이메일을 입력해 주세요').isEmail().normalizeEmail(),
    check('name', '이름 입력해 주세요').isString().isLength({ min: 2, max: 10 }),
    check('number', '사업자 번호를 입력해 주세요').isString().isLength({ min: 12, max: 12 }),
    check('password', '비밀번호를 입력해 주세요').isString().isLength({ min: 4, max: 20 }),
    check('address', '주소를 입력해 주세요').isString(),
    check('createdAt', '창업일을 입력해 주세요').custom(val => moment(val).isValid()),
    check('floor', '층수를 입력해 주세요').isInt().optional(),
    check('pointRate', '포인트 전환률을 입력해 주세요').isNumeric().optional(),
    check('tel', '전화번호를 입력해 주세요').isString().isLength({ min: 11, max: 20 }).optional(),
], (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(422).json({ error: errors.array() });

    const ps = req.body.password;
    const obj = req.body;
    delete obj.password;

    password.create(ps)
        .then(result => {
            obj.hash = result.hash;
            obj.salt = result.salt;

            return obj
        }).then(data => {
            return company.create(obj)
        }).then(company => {
            delete company.dataValues.hash;
            delete company.dataValues.salt;
            delete company.dataValues.updatedAt;

            res.json(company);
        }).catch(err => {
            if (err.name == 'SequelizeUniqueConstraintError') {
                res.status(400).json({ error: '이미 가입된 계정 입니다' })
            } else {
                res.status(500).json({ error: err })
            }
        });
});

// 업체 수정
router.put('/:id', [
    check('id').isInt(),
    check('name', '이름 입력해 주세요').isString().isLength({ min: 2, max: 10 }).optional(),
    check('number', '사업자 번호를 입력해 주세요').isString().isLength({ min: 12, max: 12 }).optional(),
    check('password', '비밀번호를 입력해 주세요').isString().isLength({ min: 4, max: 20 }).optional(),
    check('address', '주소를 입력해 주세요').isString().optional(),
    check('createdAt', '창업일을 입력해 주세요').custom(val => moment(val).isValid()).optional(),
    check('floor', '층수를 입력해 주세요').isInt().optional(),
    check('tel', '전화번호를 입력해 주세요').isString().isLength({ min: 11, max: 20 }).optional(),
], (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(422).json({ error: errors.array() });

    // 이메일 정보는 변경할 수 없음
    delete req.body.email;
    // 사업자 번호는 변경할 수 없음
    delete req.body.number;

    // 변경할 내용이 없는 경우
    if (_.isEmpty(req.body)) return res.status(204).json()

    let changeData;

    if (!_.isEmpty(req.body.password)) {
        // 변경되는 내용중에 비밀번호 항목이 있는 경우
        changeData = password.create(req.body.password)
            .then(result => {
                let data = req.body;
                delete data.password;

                data.hash = result.hash;
                data.salt = result.salt;

                return data;
            });
    } else {
        changeData = new Promise((resolve, rejcet) => {
            resolve(req.body);
        });
    }

    changeData.then(data => {
        return company.update(data, {
            where: {
                id: req.params.id
            },
            attributes: Object.keys(data)
        })
    }).then(result => {
        res.json(result);
    }).catch(err => {
        res.status(500).json({ error: err });
    });
});

// 업체 삭제
router.delete('/:id', [
    check('id').toInt()
], (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(422).json({ error: errors.array() })

    company.destroy({
        where: {
            id: req.params.id
        }
    }).then(result => {
        if (result == 1) res.json({ status: 'success' });
        else res.status(204).json({ status: 'success' });
    }).catch(err => {
        res.status(500).json(err);
    });
});

// 업체의 업주 정보가져오기
router.get('/:id/owner', (req, res) => {
    owner.findOne({
        where: {
            companyId: req.params.id
        }
    }).then(result => {
        if (_.isEmpty(result)) res.status(204).json();
        else res.status.json(result);
    }).catch(err => {
        res.status(500).json(err);
    });
});

router.post('/:id/owner', [
    check('id').isInt(),
    check('name', '이름을 입력해 주세요').isString().isLength({ min: 2, max: 20 }),
    check('gender', '성별을 입력해 주세요').isString().isLength({ min: 1, max: 1 }),
    check('phone', '휴대전화번호를 입력해 주세요').isMobilePhone(),
    check('premium', '권리금을 입력해 주세요').isNumeric(),
    check('deposit', '보증금을 입력해 주세요').isNumeric(),
    check('machinePrice', '장비구입비를 입력해 주세요').isNumeric(),
    check('loan', '대출금을 입력해 주세요').isNumeric(),
    check('etc', '기타비용을 입력해 주세요').isNumeric(),
    check('loanInterest', '대출금 이자율을 입력해 주세요').isNumeric()
], (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(422).json({ error: errors.array() });

    // 프랜차이즈를 알아내기위해 해당 업체를 조회
    company.findOne({
        where: {
            id: req.params.id
        }
    }).then(result => {
        if (_.isEmpty(result)) throw { name: '존재하지 않는 업체입니다' };

        let data = req.body;
        data.companyId = req.params.id;
        data.franchiseId = result.franchiseId;

        return owner.create(data)
    }).then(result => {
        res.json(result);
    }).catch(err => {
        if (err.name == '존재하지 않는 업체입니다') res.status(400).json({ error: err.name })
        else res.status(500).json(err)
    });
});

// 업체 업주정보 변경하기
router.put('/:id/owner/:ownerId', [
    check('id').isInt(),
    check('ownerId').isInt(),
], (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(422).json({ error: errors.array() });

    let data = req.body;

    owner.update(data, {
        where: {
            id: req.params.ownerId
        },
        attributes: Object.keys(data)
    }).then(result => {
        if (result == 1) res.json({ status: 'success' });
        else res.status(204).json({ status: 'success' });
    })
});

// 업주 삭제
router.delete('/:id/owner/:ownerId', (req, res) => {
    owner.destroy({
        where: {
            id: req.params.ownerId
        }
    }).then(result => {
        if (result == 1) res.json({ status: 'success' });
        else res.status(204).json({ status: 'success' });
    })
});
module.exports = router;