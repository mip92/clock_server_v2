import {ROLE} from "../models";
import app from "../index";
import {response} from "express";

const chai = require('chai')
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const randomInteger = (min, max) => {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}

describe('master controller', () => {

    let requester
    beforeAll(() => {
        requester = chai.request(app).keepOpen()
    })
    afterAll(() => {
        requester.close()
    })

    describe('create master', () => {
        test('generate token', () => {
            return requester.post('/api/auth/login')
                .send({email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD}).then((res) => {
                    expect(res.body.token).not.toEqual(null)
                })
        })
        test('create master with short name', () => {
            return new Promise((resolve, reject) => {
                requester.post(`/api/auth/login`)
                    .send({email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD}).then((response) => {
                    expect(response.body.name).toEqual('admin')
                    expect(response.body.token).not.toBe(null)
                    resolve(requester.post(`/api/masters`)
                        .set('Authorization', `Bearer ${response.body.token}`)
                        .send({name: "Short", email: "simple@valid.email", citiesId: 1}).then((response) => {
                            expect(response.body.errors[0].msg).toEqual('name must be longer than 6 symbols')
                        })
                    )
                })
            })
        })
        test('create master with not valid email', () => {
            return new Promise((resolve, reject) => {
                requester.post(`/api/auth/login`)
                    .send({email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD}).then((response) => {
                    expect(response.body.name).toEqual('admin')
                    expect(response.body.token).not.toBe(null)
                    resolve(requester.post(`/api/masters`).set('Authorization', `Bearer ${response.body.token}`)
                        .send({name: "NormalLongName", email: "not@validemail", citiesId: 1}).then((response) => {
                            expect(response.body.errors[0].msg).toEqual("email must be a valid email format")
                        })
                    )
                })
            })
        })
        test('create and remove master', () => {
            return new Promise((resolve, reject) => {
                let token: string
                let masterId: string
                requester.post(`/api/auth/login`)
                    .send({email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD}).then((response) => {
                    expect(response.body.name).toEqual('admin')
                    expect(response.body.token).not.toBe(null)
                    token = response.body.token
                    requester.post(`/api/masters`)
                        .set('Authorization', `Bearer ${token}`)
                        .send({
                            name: "NormalLongName",
                            email: "example@gmail.com",
                            citiesId: '[1]'
                        }).then((response) => {
                        expect(response.body.email).toBe('example@gmail.com')
                        masterId = response.body.id
                        resolve(requester.delete(`/api/masters/${masterId}`)
                            .set('Authorization', `Bearer ${token}`).then((response) => {
                                expect(response.body.message).toBe(`master with id:${masterId} was deleted`)
                            })
                        )
                    })
                })
            })
        })
        test('create master with duplicate email', () => {
            return new Promise((resolve, reject) => {
                let token: string
                let masterId: string
                requester.post(`/api/auth/login`)
                    .send({email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD}).then((response) => {
                    expect(response.body.name).toEqual('admin')
                    expect(response.body.token).not.toBe(null)
                    token = response.body.token
                    requester.post(`/api/masters`)
                        .set('Authorization', `Bearer ${token}`)
                        .send({
                            name: "NormalLongName",
                            email: "example@gmail.com",
                            citiesId: '[1]'
                        }).then((response) => {
                        masterId = response.body.id
                        expect(response.body.email).toBe('example@gmail.com')
                        requester.post(`/api/masters`)
                            .set('Authorization', `Bearer ${token}`)
                            .send({
                                name: "NormalLongName2",
                                email: "example@gmail.com",
                                citiesId: '[1]'
                            }).then((response) => {
                            expect(JSON.parse(response.body.message).msg).toEqual('Master with this email is already registered')
                            resolve(requester.delete(`/api/masters/${masterId}`)
                                .set('Authorization', `Bearer ${token}`).then((response) => {
                                    expect(response.body.message).toBe(`master with id:${masterId} was deleted`)
                                })
                            )
                        })
                    })
                })
            })
        })
    })
    describe('get masters', () => {
        test('masters count must be 2', () => {
            return new Promise((resolve, reject) => {
                const limit = '2';
                const offset = '';
                const cities = '';
                const sortBy = '';
                const select = '';
                const filter = '';
                resolve(requester.get(`/api/masters?limit=${limit}&offset=${offset}&cities=${cities}&sortBy=${sortBy}&select=${select}&filter=${filter}`).then((response) => {
                        expect(response.body.rows.length).toBeLessThan(2)
                    })
                )
            })
        })
        test('master length must be less than 50', () => {
            return new Promise((resolve, reject) => {
                const limit = '2';
                const offset = '';
                const cities = '';
                const sortBy = '';
                const select = '';
                const filter = '';
                resolve(requester.get(`/api/masters?limit=${limit}&offset=${offset}&cities=${cities}&sortBy=${sortBy}&select=${select}&filter=${filter}`).then((response) => {
                        expect(response.body.rows.length).toBeLessThanOrEqual(50)
                    })
                )
            })
        })
        test('find masters with city id not equal 1', async () => {
            return new Promise((resolve, reject) => {
                const limit = '';
                const offset = '';
                const cities = '1';
                const sortBy = '';
                const select = '';
                const filter = '';
                resolve(requester.get(`/api/masters?limit=${limit}&offset=${offset}&cities=${cities}&sortBy=${sortBy}&select=${select}&filter=${filter}`).then((response) => {
                        expect(response.body.rows.length).toBeLessThanOrEqual(50)
                        const citiesWithOtherId = response.body.rows.map((master) => {
                            const cityWithOtherId = master.cities.filter((city) => city.id !== 1)
                            return cityWithOtherId.length
                        })
                        const sumOtherCities = citiesWithOtherId.reduce(function (sum, elem) {
                            return sum + elem;
                        }, 0);
                        expect(sumOtherCities).toBe(0)
                    })
                )
            })
        })
    })
    describe('get one master', () => {
        let token: string
        let masterId: string
        beforeAll(() => {
            return new Promise((resolve, reject) => {
                requester.post(`/api/auth/login`)
                    .send({email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD}).then((response) => {
                    expect(response.body.name).toEqual('admin')
                    expect(response.body.token).not.toBe(null)
                    token = response.body.token
                    resolve(requester.post(`/api/masters`)
                        .set('Authorization', `Bearer ${token}`)
                        .send({
                            name: "NormalLongName",
                            email: "example@gmail.com",
                            citiesId: '[1]'
                        }).then((response) => {
                            expect(response.body.email).toBe('example@gmail.com')
                            masterId = response.body.id
                        })
                    )
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
        test('masters values mast be valid', () => {
            return new Promise((resolve, reject) => {
                resolve(requester.get(`/api/masters/getOneMaster/${masterId}`).then((response) => {
                        expect(response.body.cities[0].cityName).toBe("Lviv")
                        expect(response.body.isActivated).toBe(false)
                        expect(response.body.email).toBe("example@gmail.com")
                        expect(response.body.id).toBe(masterId)
                        expect(response.body.role).toBe(ROLE.Master)
                    })
                )
            })
        })
        test('masters values mast be not valid', () => {
            const id = randomInteger(5000000, 7000000)
            return new Promise((resolve, reject) => {
                resolve(requester.get(`/api/masters/getOneMaster/${id}`).then((response) => {
                        expect(response.body.message).toStrictEqual("Master not found")
                    })
                )
            })
        })
    })
    describe('update one master', () => {
        let token: string
        let masterId: string
        beforeAll(() => {
            return new Promise((resolve, reject) => {
                requester.post(`/api/auth/login`)
                    .send({email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD}).then((response) => {
                    expect(response.body.name).toEqual('admin')
                    expect(response.body.token).not.toBe(null)
                    token = response.body.token
                    resolve(requester.post(`/api/masters`)
                        .set('Authorization', `Bearer ${token}`)
                        .send({
                            name: "NormalLongName",
                            email: "example@gmail.com",
                            citiesId: '[1]'
                        }).then((response) => {
                            expect(response.body.email).toBe('example@gmail.com')
                            masterId = response.body.id
                        })
                    )
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
        test('update master with not valid dates', () => {
            return new Promise((resolve, reject) => {
                resolve(requester.put(`/api/masters/`)
                    .set('Authorization', `Bearer ${token}`)
                    .send({id: masterId, name: "newNameAfterUpdate", email: "notValid@email"}).then((response) => {
                        expect(response.body.errors[0].msg).toStrictEqual("email must be a valid email format")
                        expect(response.body.errors[1].msg).toStrictEqual("cityId is required")
                    })
                )
            })
        })
        test('update master with valid dates', async () => {
            return new Promise((resolve, reject) => {
                resolve(requester.put(`/api/masters/`)
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        id: masterId,
                        name: "newNameAfterUpdate",
                        email: "new@validemail.com",
                        citiesId: '1'
                    }).then((response) => {
                        expect(response.body.cities[0].id).toStrictEqual(1)
                        expect(response.body.name).toStrictEqual("newNameAfterUpdate")
                        expect(response.body.email).toStrictEqual("new@validemail.com")
                    })
                )
            })
        })
        test('update master with random id', async () => {
            return new Promise((resolve, reject) => {
                resolve(requester.put(`/api/masters/`)
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        id: randomInteger(5000000, 7000000),
                        name: "newNameAfterUpdate",
                        email: "new@validemail.com",
                        citiesId: '1'
                    }).then((response) => {
                        expect(JSON.parse(response.body.message).msg).toStrictEqual("Master with this id is not found")
                    })
                )
            })
        })
    })
    describe('delete one master', () => {
        let token: string
        let masterId: string
        beforeAll(() => {
            return new Promise((resolve, reject) => {
                requester.post(`/api/auth/login`)
                    .send({email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD}).then((response) => {
                    expect(response.body.name).toEqual('admin')
                    expect(response.body.token).not.toBe(null)
                    token = response.body.token
                    resolve(requester.post(`/api/masters`)
                        .set('Authorization', `Bearer ${token}`)
                        .send({
                            name: "NormalLongName",
                            email: "example@gmail.com",
                            citiesId: '[1]'
                        }).then((response) => {
                            expect(response.body.email).toBe('example@gmail.com')
                            masterId = response.body.id
                        })
                    )
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
        test('delete master', () => {
            return new Promise((resolve, reject) => {
                resolve(requester.delete(`/api/masters/${masterId}`)
                    .set('Authorization', `Bearer ${token}`).then((response) => {
                        expect(response.body.message).toStrictEqual(`master with id:${masterId} was deleted`)
                    })
                )
            })
        })
        test('delete master with randomId', () => {
            const randomId = randomInteger(5000000, 7000000)
            return new Promise((resolve, reject) => {
                resolve(requester.delete(`/api/masters/${randomId}`)
                    .set('Authorization', `Bearer ${token}`).then((response) => {
                        expect(response.body.message).toStrictEqual(`master with id:${randomId} is not defined`)
                    })
                )
            })
        })
    })
    describe('approve Master', () => {
        let token: string
        let masterId: string
        beforeAll(() => {
            return new Promise((resolve, reject) => {
                requester.post(`/api/auth/login`)
                    .send({email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD}).then((response) => {
                    expect(response.body.name).toEqual('admin')
                    expect(response.body.token).not.toBe(null)
                    token = response.body.token
                    resolve(requester.post(`/api/masters`)
                        .set('Authorization', `Bearer ${token}`)
                        .send({
                            name: "NormalLongName",
                            email: "example@gmail.com",
                            citiesId: '[1]'
                        }).then((response) => {
                            expect(response.body.email).toBe('example@gmail.com')
                            masterId = response.body.id
                        })
                    )
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
        test('Approve master mast be true', () => {
            return new Promise((resolve, reject) => {
                resolve(requester.get(`/api/masters/getOneMaster/${masterId}`).then((response) => {
                        expect(response.body.isApproved).toStrictEqual(true)
                    })
                )
            })
        })
        test('Approve master', () => {
            return new Promise((resolve, reject) => {
                resolve(requester.get(`/api/masters/approve/${masterId}`)
                    .set('Authorization', `Bearer ${token}`).then((response) => {
                        expect(response.body.message).toStrictEqual(`master with id:${masterId} changed status approve`)
                    })
                )
            })
        })
        test('Approve master with randomId', () => {
                const randomId = randomInteger(5000000, 7000000)
                return new Promise((resolve, reject) => {
                    resolve(requester.get(`/api/masters/approve/${randomId}`)
                        .set('Authorization', `Bearer ${token}`).then((response) => {
                            expect(response.body.message).toStrictEqual(`master with id:${randomId} is not defined`)
                        })
                    )
                })
            }
        )
    })
    describe('get free masters', () => {
        let token: string
        let masterId: string
        beforeAll(() => {
            return new Promise((resolve, reject) => {
                requester.post(`/api/auth/login`)
                    .send({email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD}).then((response) => {
                    expect(response.body.name).toEqual('admin')
                    expect(response.body.token).not.toBe(null)
                    token = response.body.token

                        requester.post(`/api/masters`)
                            .set('Authorization', `Bearer ${token}`)
                            .send({
                                name: "NormalLongName",
                                email: "example@gmail.com",
                                citiesId: '[1]'
                            }).then((response) => {
                            expect(response.body.email).toBe('example@gmail.com')
                            expect(response).toBe('example@gmail.com')
                            masterId = response.body.id

                            requester.get(`/api/activate/${response.body.link}`)
                            resolve('1')
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
        test('master is free', async () => {
            return new Promise((resolve, reject) => {
                requester.get(`/api/masters/getOneMaster/${masterId}`).then((response) => {
                    expect(response.body.cities[0].id).toStrictEqual(1)
                    expect(response.body.email).toStrictEqual("example@gmail.com")
                    const date = new Date(Date.now())
                    date.setDate(date.getDate() + 20)
                    resolve(requester.get(`/api/masters/getFreeMasters?cityId=1&dateTime=${date.toISOString()}&clockSize=1&limit=50&offset=0`).then((response) => {
                            expect(response).toStrictEqual(1)
                            const ourMaster = response.body.filter((master) => master.id === masterId)
                            expect(ourMaster.length).toStrictEqual(1)
                        })
                    )
                })
            })
        })
    })
})


/*chai.request(app).post('/api/cities/')
    .set('Authorization', `Bearer ${res.body.token}`)
    .send({city: "Dnipro", price: 500})
    .then(function (res) {
        expect(JSON.parse(res.body.message).msg).toEqual('City with this name: Dnipro is not unique')
        chai.request(app).get('/api/cities/')
            .then(function (res) {
                expect(res.body.rows.find(city => city.cityName === "Dnipro").price).toBe(500)
                done();
            });
    });*/


/*


    describe('get free masters', () => {

        test('master is free', async () => {
            const response = await axios.get(`${process.env.API_URL}/api/masters/getOneMaster/${id}`)
            expect(response.data.cities[0].id).toStrictEqual(1)
            expect(response.data.email).toStrictEqual("some@valid.email")
            const response2 = await axios.get(`${process.env.API_URL}/api/masters/getFreeMasters?cityId=1&dateTime=2022-06-23T05:00:00.000Z&clockSize=1&limit=50&offset=0`)
            const ourMaster = response2.data.filter((master) => master.id === id)
            expect(ourMaster.length).toStrictEqual(1)
        })
        /!*test('master is busy', async () => {
            const response0 = await axios.get(`${process.env.API_URL}/api/masters/getOneMaster/${id}`)
            expect(response0.data.id).toStrictEqual(id)
            const response = await axios.post(`${process.env.API_URL}/api/order`, {
                cityId: "1",
                clockSize: '1',
                dateTime: "2022-06-23T05:00:00.000Z",
                email: "user@gmail.com",
                masterId: id,
                name: "longUserName"
            })
            expect(response.data.masterId).toStrictEqual(id)
            try {
                const response2 = await axios.get(`${process.env.API_URL}/api/masters/getFreeMasters?cityId=1&dateTime=2022-06-23T05:00:00.000Z&clockSize=1&limit=50&offset=0`)
                const ourMaster = response2.data.filter((master) => master.id === id)
                expect(ourMaster.length).toStrictEqual(0)
            } catch (e: any) {
                expect(e.response.data.message).toStrictEqual("masters is not found")
                Order.destroy({where: {masterId: id}})
                MasterBusyDate.destroy({where: {masterId: id}})
            }
        })*!/
        test('not valid date', async () => {
            try {
                await axios.get(`${process.env.API_URL}/api/masters/getFreeMasters?cityId=1&dateTime=aaaww&clockSize=1&limit=50&offset=0`)
            } catch (e: any) {
                expect(e.response.data.message).toStrictEqual(`Not valid date format`)
            }
        })
    })

    describe('registration master', () => {
        test('token must be not null', async () => {
            const response = await axios.post(`${process.env.API_URL}/api/auth/registration`, {
                firstPassword: 123456, secondPassword: 123456, isRulesChecked: true, isMaster: true,
                email: "some@valid.email", name: "someValidName", citiesId: [1],
            })
            expect(response.data.token).not.toBe(null)
            const master: MasterModel | null = await Master.findOne({where: {email: "some@valid.email"}})
            master && await MasterCity.destroy({where: {masterId: master.id}})
            master && await Master.destroy({where: {id: master.id}})
        })
        test('not valid password', async () => {
            try {
                await axios.post(`${process.env.API_URL}/api/auth/registration`, {
                    firstPassword: 12, secondPassword: 1, isRulesChecked: true, isMaster: true,
                    email: "some@valid.email", name: "someValidName", citiesId: [1],
                })
            } catch (e: any) {
                expect(e.response.data.errors[0].msg).toStrictEqual(`password must be longer than 3 symbols`)
            }

        })
        test('two different passwords', async () => {
            try {
                await axios.post(`${process.env.API_URL}/api/auth/registration`, {
                    firstPassword: 123456, secondPassword: 123457, isRulesChecked: true, isMaster: true,
                    email: "some@valid.email", name: "someValidName", citiesId: [1],
                })
            } catch (e: any) {
                expect(e.response.data.message).toStrictEqual(`Passwords do not match`)
            }

        })
    })

    describe('change master email', () => {
        test('change to valid email', async () => {
            const response = await axios.post(`${process.env.API_URL}/api/auth/registration`, {
                firstPassword: 123456, secondPassword: 123456, isRulesChecked: true, isMaster: true,
                email: "some@valid.email", name: "someValidName", citiesId: [1]
            })
            expect(response.data.token).not.toBe(null)

            const response2 = await axios.put(`${process.env.API_URL}/api/masters/changeEmail`, {
                password: 123456, currentEmail: "some@valid.email", newEmail: "some@valid2.com"
            }, {headers: {Authorization: `Bearer ${response.data.token}`}})
            expect(response2.data.token).not.toBe(null)
            const master: MasterModel | null = await Master.findOne({where: {email: "some@valid2.com"}})
            master && await MasterCity.destroy({where: {masterId: master.id}})
            master && await Master.destroy({where: {email: "some@valid2.com"}})
        })
        test('change to not valid email', async () => {
            const response = await axios.post(`${process.env.API_URL}/api/auth/registration`, {
                firstPassword: 123456, secondPassword: 123456, isRulesChecked: true, isMaster: true,
                email: "some@valid.email", name: "someValidName", citiesId: [1]
            })
            expect(response.data.token).not.toBe(null)
            try {
                await axios.put(`${process.env.API_URL}/api/masters/changeEmail`, {
                    password: 123456, currentEmail: "some@valid.email", newEmail: "somevalid.com"
                }, {headers: {Authorization: `Bearer ${response.data.token}`}})
            } catch (e: any) {
                expect(e.response.data.errors[0].msg).toBe('email must be a valid email format')
                const master: MasterModel | null = await Master.findOne({where: {email: "some@valid.email"}})
                master && expect(master.email).toBe("some@valid.email")
                master && await MasterCity.destroy({where: {masterId: master.id}})
                master && await Master.destroy({where: {id: master.id}})
            }
        })
        test('change random email', async () => {
            const response = await axios.post(`${process.env.API_URL}/api/auth/registration`, {
                firstPassword: 123456, secondPassword: 123456, isRulesChecked: true, isMaster: true,
                email: "some@valid.email", name: "someValidName", citiesId: [1]
            })
            expect(response.data.token).not.toBe(null)
            try {
                await axios.put(`${process.env.API_URL}/api/masters/changeEmail`, {
                    password: 123456, currentEmail: "Random@valid.randomEmail", newEmail: "someRandom@valid.email"
                }, {headers: {Authorization: `Bearer ${response.data.token}`}})
            } catch (e: any) {
                expect(JSON.parse(e.response.data.message).msg).toBe('Master is not found or password is wrong')
                const master: MasterModel | null = await Master.findOne({where: {email: "some@valid.email"}})
                master && expect(master.email).toBe("some@valid.email")
                master && await MasterCity.destroy({where: {masterId: master.id}})
                master && await Master.destroy({where: {id: master.id}})
            }
        })
    })*/
