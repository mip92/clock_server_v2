import express from "express";

const router = express.Router();
import masterController from '../controller/master.controller';
import checkRoles from "../middlwares/checkRolesMiddleware";
import checkRules2 from "../middlwares/checkRulesMiddleware";
import {body, query} from 'express-validator';
import {ROLE} from "../models";

const validationCreateMasterBodyRules = [
    body('name', "name must be longer than 6 symbols").isLength({min: 6}).not().isEmpty().escape(),
    body('email', 'email must be a valid email format').not().isEmpty().isEmail().normalizeEmail(),
    body('citiesId', 'cityId is required').not().isEmpty().escape()
];
const validationChangeEmailBodyRules = [
    body('password', "password must be longer than 6 symbols").isLength({min: 6}).not().isEmpty().escape(),
    body('currentEmail', 'email must be a valid email format').not().isEmpty().isEmail().normalizeEmail(),
    body('newEmail', 'email must be a valid email format').not().isEmpty().isEmail().normalizeEmail(),
    body('role', 'role must be not null').not()
];
const validationGetFreeMastersQueryRules = [
    query('cityId', 'cityId is required').not().isEmpty().escape(),
    query('dateTime', 'dateTime is required').not().isEmpty().escape(),
    query('clockSize', 'clockSize is required').not().escape(),
    query('limit', 'limit is required').not().escape(),
    query('offset', 'offset is required').not().escape()
];

router.post('/', checkRoles([ROLE.Admin]), validationCreateMasterBodyRules, checkRules2, (res: any, req: any, next: any) => {
    masterController.createMaster(res, req, next)
});
router.get('/', (res: any, req: any, next: any) => {
    masterController.getAllMasters(res, req, next)
});
router.get('/getFreeMasters', validationGetFreeMastersQueryRules, checkRules2, (res: any, req: any, next: any) => {
    masterController.getFreeMasters(res, req, next)
});
router.get('/getOneMaster/:masterId', (res: any, req: any, next: any) => {
    masterController.getOneMaster(res, req, next)
});
router.put('/', checkRoles([ROLE.Admin]), validationCreateMasterBodyRules, checkRules2, (res: any, req: any, next: any) => {
    masterController.updateMaster(res, req, next)
});
router.delete('/:masterId', checkRoles([ROLE.Admin]), (res: any, req: any, next: any) => {
    masterController.deleteMaster(res, req, next)
});
router.get('/approve/:masterId', checkRoles([ROLE.Admin]), (res: any, req: any, next: any) => {
    masterController.approveMaster(res, req, next)
});
router.put('/changeEmail', checkRoles([ROLE.Master]), validationChangeEmailBodyRules, checkRules2, (res: any, req: any, next: any) => {
    masterController.changeEmail(res, req, next)
})


export default router