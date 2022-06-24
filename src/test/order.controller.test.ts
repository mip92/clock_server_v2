import chai from 'chai';
import chaiHttp from 'chai-http';
import app from "../index";
import {dbConfig, Master, MasterBusyDate, Order, STATUSES, User} from "../models";
import {randomInteger} from "./master.controller.test";

chai.use(chaiHttp);

describe('master controller', () => {

    let requester
    beforeAll(() => {
        requester = chai.request(app).keepOpen()
    })
    afterAll(() => {
        requester.close()
    })

    describe('create order', () => {
        let token: string
        let masterId: string
        const date = new Date(Date.now())
        date.setDate(date.getDate() + 20)
        beforeAll(() => {
            return new Promise((resolve, reject) => {
                dbConfig.authenticate().then(() => {
                    dbConfig.sync().then(() => {
                        requester.post(`/api/auth/login`)
                            .send({
                                email: process.env.ADMIN_EMAIL,
                                password: process.env.ADMIN_PASSWORD
                            }).then((response) => {
                            expect(response.body.name).toEqual('admin')
                            expect(response.body.token).not.toBe(null)
                            token = response.body.token
                            resolve(
                                requester.post(`/api/masters`)
                                    .set('Authorization', `Bearer ${token}`)
                                    .send({
                                        name: "NormalLongName",
                                        email: "example@gmail.com",
                                        citiesId: '[1]'
                                    }).then((response) => {
                                    expect(response.body.email).toBe('example@gmail.com')
                                    masterId = response.body.id
                                    Master.findOne({where: {id: masterId}}).then((master) => {
                                        master?.update({isActivated: true})
                                    })
                                })
                            )
                        })
                    })
                })
            })
        })
        afterAll(() => {
            return new Promise((resolve, reject) => {
                resolve(requester.delete(`/api/masters/${masterId}`)
                    .set('Authorization', `Bearer ${token}`).then((response) => {
                        expect(response.body.message).toBe(`master with id:${masterId} was deleted`)
                    })
                )
            })
        })
        test('create order with valid data', () => {
            return new Promise((resolve, reject) => {
                requester.get(`/api/masters/getOneMaster/${masterId}`).then((response) => {
                    expect(response.body.cities[0].id).toStrictEqual(1)
                    expect(response.body.email).toStrictEqual("example@gmail.com")
                    requester.get(`/api/masters/getFreeMasters?cityId=1&dateTime=${date.toISOString()}&clockSize=1&limit=50&offset=0`).then((response) => {
                        const ourMaster = response.body.some((master) => master.id === masterId)
                        expect(ourMaster).toEqual(true)
                        resolve(
                            requester.post(`/api/order`)
                                .send({
                                    cityId: 1,
                                    clockSize: 1,
                                    dateTime: date.toISOString(),
                                    email: "sdd@dd.dc",
                                    masterId: masterId,
                                    name: "dddddd",
                                }).then((response) => {
                                expect(response.body.status).toEqual(STATUSES.Approved)
                                expect(response.body.masterId).toEqual(masterId)
                                Order.destroy({where: {id: response.body.id}}).then(() => {
                                    User.destroy({where: {id: response.body.userId}})
                                })
                            })
                        )
                    })
                })
            })
        })
        test('master is busy', () => {
            return new Promise((resolve, reject) => {
                requester.get(`/api/masters/getOneMaster/${masterId}`).then((response) => {
                    expect(response.body.id).toStrictEqual(masterId)
                    requester.post(`/api/order`)
                        .send({
                            cityId: "1",
                            clockSize: '1',
                            dateTime: date.toISOString(),
                            email: "user@gmail.com",
                            masterId: masterId,
                            name: "longUserName"
                        }).then((response) => {
                        expect(response.body.masterId).toStrictEqual(masterId)
                        resolve(
                            requester.get(`/api/masters/getFreeMasters?cityId=1&dateTime=${date.toISOString()}&clockSize=1&limit=50&offset=0`).then((response) => {
                                const ourMaster = response.body.find((master) => master.id === masterId)
                                expect(ourMaster).toStrictEqual(undefined)
                            })
                        )
                    })
                })
            })
        })
    })
})
/*test('create order with not valid data', () => {
    return new Promise((resolve, reject) => {
        requester.get(`/api/masters/getOneMaster/${masterId}`).then((response) => {
            expect(response.body.cities[0].id).toStrictEqual(1)
            expect(response.body.email).toStrictEqual("example@gmail.com")
            requester.get(`/api/masters/getFreeMasters?cityId=1&dateTime=${date.toISOString()}&clockSize=1&limit=50&offset=0`).then((response) => {

                const ourMaster = response.body.find((master) => master.id === masterId)
                expect(ourMaster.id).toEqual(masterId)
                resolve(
                    requester.post(`/api/order`)
                        .send({
                            cityId: 1,
                            clockSize: 1,
                            dateTime: date.toISOString(),
                            email: "sdd@dd.dc",
                            masterId: 45666655,
                            name: "dddddd",
                        }).then((response) => {
                        expect(response.body.message).toEqual('master is not found')
                    })
                )
            })
        })
    })
})*/


