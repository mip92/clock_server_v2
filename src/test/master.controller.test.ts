import {dbConfig, Master, Order, ROLE, STATUSES, User} from "../models";
import app from "../index";

import chai from 'chai';
import chaiHttp from 'chai-http';

chai.use(chaiHttp);

export const randomInteger = (min, max) => {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}
describe('combine', () => {
    let requester

    beforeAll(() => {
        requester = chai.request(app).keepOpen()
        dbConfig.authenticate().then(() => {
            dbConfig.sync()
        })
    })

    afterAll(() => {
        requester.close()
    })

    describe('master controller', () => {
        describe('create master', () => {
            test('generate token', () => {
                return requester.post('/api/auth/login')
                    .send({email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD}).then((res) => {
                        expect(res.body.token).not.toEqual(null)
                    })
            },10000)
            test('create master with short name', () => {
                return new Promise((resolve, reject) => {
                    requester.post(`/api/auth/login`)
                        .send({
                            email: process.env.ADMIN_EMAIL,
                            password: process.env.ADMIN_PASSWORD
                        }).then((response) => {
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
            },10000)
            test('create master with not valid email', () => {
                return new Promise((resolve, reject) => {
                    requester.post(`/api/auth/login`)
                        .send({
                            email: process.env.ADMIN_EMAIL,
                            password: process.env.ADMIN_PASSWORD
                        }).then((response) => {
                        expect(response.body.name).toEqual('admin')
                        expect(response.body.token).not.toBe(null)
                        resolve(requester.post(`/api/masters`).set('Authorization', `Bearer ${response.body.token}`)
                            .send({name: "NormalLongName", email: "not@validemail", citiesId: 1}).then((response) => {
                                expect(response.body.errors[0].msg).toEqual("email must be a valid email format")
                            })
                        )
                    })
                })
            },10000)
            test('create and remove master', () => {
                return new Promise((resolve, reject) => {
                    let token: string
                    let masterId: string
                    requester.post(`/api/auth/login`)
                        .send({
                            email: process.env.ADMIN_EMAIL,
                            password: process.env.ADMIN_PASSWORD
                        }).then((response) => {
                        expect(response.body.name).toEqual('admin')
                        expect(response.body.token).not.toBe(null)
                        token = response.body.token
                        requester.post(`/api/masters`)
                            .set('Authorization', `Bearer ${token}`)
                            .send({
                                name: "NormalLongName",
                                email: "example3@gmail.com",
                                citiesId: '[1]'
                            }).then((response) => {
                            expect(response.body.email).toEqual('example3@gmail.com')
                            masterId = response.body.id
                            resolve(requester.delete(`/api/masters/${masterId}`)
                                .set('Authorization', `Bearer ${token}`).then((response) => {
                                    expect(response.body.message).toBe(`master with id:${masterId} was deleted`)
                                })
                            )
                        })
                    })
                })
            },10000)
            test('create master with duplicate email', () => {
                return new Promise((resolve, reject) => {
                    let token: string
                    let masterId: string
                    requester.post(`/api/auth/login`)
                        .send({
                            email: process.env.ADMIN_EMAIL,
                            password: process.env.ADMIN_PASSWORD
                        }).then((response) => {
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
            },10000)
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
            },10000)
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
            },10000)
            test('find masters with city id not equal 1', () => {
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
            },10000)
        })
        describe('get one master', () => {
            let token: string
            let masterId: string
            beforeAll(() => {
                return new Promise((resolve, reject) => {
                    requester.post(`/api/auth/login`)
                        .send({
                            email: process.env.ADMIN_EMAIL,
                            password: process.env.ADMIN_PASSWORD
                        }).then((response) => {
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
            },10000)
            test('masters values mast be not valid', () => {
                const id = randomInteger(5000000, 7000000)
                return new Promise((resolve, reject) => {
                    resolve(requester.get(`/api/masters/getOneMaster/${id}`).then((response) => {
                            expect(response.body.message).toStrictEqual("Master not found")
                        })
                    )
                })
            },10000)
        })
        describe('update one master', () => {
            let token: string
            let masterId: string
            beforeAll(() => {
                return new Promise((resolve, reject) => {
                    requester.post(`/api/auth/login`)
                        .send({
                            email: process.env.ADMIN_EMAIL,
                            password: process.env.ADMIN_PASSWORD
                        }).then((response) => {
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
            },10000)
            test('update master with valid dates', () => {
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
            },10000)
            test('update master with random id', () => {
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
            },10000)
        })
        describe('delete one master', () => {
            let token: string
            let masterId: string
            beforeAll(() => {
                return new Promise((resolve, reject) => {
                    requester.post(`/api/auth/login`)
                        .send({
                            email: process.env.ADMIN_EMAIL,
                            password: process.env.ADMIN_PASSWORD
                        }).then((response) => {
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
            test('delete master', () => {
                return new Promise((resolve, reject) => {
                    resolve(requester.delete(`/api/masters/${masterId}`)
                        .set('Authorization', `Bearer ${token}`).then((response) => {
                            expect(response.body.message).toStrictEqual(`master with id:${masterId} was deleted`)
                        })
                    )
                })
            },10000)
            test('delete master with randomId', () => {
                const randomId = randomInteger(5000000, 7000000)
                return new Promise((resolve, reject) => {
                    resolve(requester.delete(`/api/masters/${randomId}`)
                        .set('Authorization', `Bearer ${token}`).then((response) => {
                            expect(response.body.message).toStrictEqual(`master with id:${randomId} is not defined`)
                        })
                    )
                })
            },10000)
        })
        describe('approve Master', () => {
            let token: string
            let masterId: string
            beforeAll(() => {
                return new Promise((resolve, reject) => {
                    requester.post(`/api/auth/login`)
                        .send({
                            email: process.env.ADMIN_EMAIL,
                            password: process.env.ADMIN_PASSWORD
                        }).then((response) => {
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
            },10000)
            test('Approve master', () => {
                return new Promise((resolve, reject) => {
                    resolve(requester.get(`/api/masters/approve/${masterId}`)
                        .set('Authorization', `Bearer ${token}`).then((response) => {
                            expect(response.body.message).toStrictEqual(`master with id:${masterId} changed status approve`)
                        })
                    )
                })
            },10000)
            test('Approve master with randomId', () => {
                    const randomId = randomInteger(5000000, 7000000)
                    return new Promise((resolve, reject) => {
                        resolve(requester.get(`/api/masters/approve/${randomId}`)
                            .set('Authorization', `Bearer ${token}`).then((response) => {
                                expect(response.body.message).toStrictEqual(`master with id:${randomId} is not defined`)
                            })
                        )
                    })
                },10000)
        })
        describe('get free masters', () => {
            let token: string
            let masterId: string
            const date = new Date(Date.now())
            date.setDate(date.getDate() + 20)
            beforeAll(() => {
                return new Promise((resolve, reject) => {
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
            afterAll(() => {
                return new Promise((resolve, reject) => {
                    resolve(requester.delete(`/api/masters/${masterId}`)
                        .set('Authorization', `Bearer ${token}`).then((response) => {
                            expect(response.body.message).toBe(`master with id:${masterId} was deleted`)
                        })
                    )
                })
            })
            test('master is free', () => {
                return new Promise((resolve, reject) => {
                    requester.get(`/api/masters/getOneMaster/${masterId}`).then((response) => {
                        expect(response.body.cities[0].id).toStrictEqual(1)
                        expect(response.body.email).toStrictEqual("example@gmail.com")
                        resolve(requester.get(`/api/masters/getFreeMasters?cityId=1&dateTime=${date.toISOString()}&clockSize=1&limit=50&offset=0`).then((response) => {
                                const ourMaster = response.body.filter((master) => master.id === masterId)
                                expect(ourMaster.length).toStrictEqual(1)
                            })
                        )
                    })
                })
            },10000)
            test('not valid date', () => {
                return new Promise((resolve, reject) => {
                    resolve(
                        requester.get(`/api/masters/getFreeMasters?cityId=1&dateTime=aaaww&clockSize=1&limit=50&offset=0`).then((response) => {
                            expect(response.body.message).toStrictEqual(`Not valid date format`)
                        })
                    )
                })
            },10000)
        })
        describe('registration master', () => {
            let token: string
            beforeAll(() => {
                return new Promise((resolve, reject) => {
                    resolve(
                        requester.post(`/api/auth/login`)
                            .send({
                                email: process.env.ADMIN_EMAIL,
                                password: process.env.ADMIN_PASSWORD
                            }).then((response) => {
                            expect(response.body.name).toEqual('admin')
                            expect(response.body.token).not.toBe(null)
                            token = response.body.token
                        })
                    )
                })
            })
            test('token must be not null', () => {

                return new Promise((resolve, reject) => {
                    requester.post(`/api/auth/registration`)
                        .set('Authorization', `Bearer ${token}`)
                        .send({
                            firstPassword: 123456, secondPassword: 123456, isRulesChecked: true, isMaster: true,
                            email: "some@valid.email", name: "someValidName", citiesId: [1],
                        }).then(() => {
                        requester.get('/api/masters').then((response) => {
                            const master = response.body.rows.find(master => master.email === "some@valid.email")
                            expect(master.email).toBe("some@valid.email")
                            resolve(
                                requester.delete(`/api/masters/${master.id}`)
                                    .set('Authorization', `Bearer ${token}`).then((response) => {
                                    expect(response.body.message).toStrictEqual(`master with id:${master.id} was deleted`)
                                })
                            )
                        })
                    })
                })
            },10000)
            test('not valid password', () => {
                return new Promise((resolve, reject) => {
                    resolve(
                        requester.post(`/api/auth/registration`)
                            .set('Authorization', `Bearer ${token}`)
                            .send({
                                firstPassword: 12, secondPassword: 1, isRulesChecked: true, isMaster: true,
                                email: "some@valid.email", name: "someValidName", citiesId: [1],
                            }).then((response) => {
                            expect(response.body.errors[0].msg).toStrictEqual(`password must be longer than 3 symbols`)
                        })
                    )
                })
            },10000)
            test('two different passwords', () => {
                return new Promise((resolve, reject) => {
                    resolve(
                        requester.post(`/api/auth/registration`)
                            .set('Authorization', `Bearer ${token}`)
                            .send({
                                firstPassword: 123456, secondPassword: 123457, isRulesChecked: true, isMaster: true,
                                email: "some@valid.email", name: "someValidName", citiesId: [1],
                            }).then((response) => {
                            expect(response.body.message).toStrictEqual(`Passwords do not match`)
                        })
                    )
                })
            },10000)
        })
        describe('change master email', () => {
            let token: string
            let masterId: string
            beforeEach(() => {
                return new Promise((resolve, reject) => {
                    requester.post(`/api/auth/login`)
                        .send({
                            email: process.env.ADMIN_EMAIL,
                            password: process.env.ADMIN_PASSWORD
                        }).then((response) => {
                        token = response.body.token
                        requester.post(`/api/auth/registration`)
                            .send({
                                firstPassword: 123456,
                                secondPassword: 123456,
                                isRulesChecked: true,
                                isMaster: true,
                                email: "some@valid.email",
                                name: "someValidName",
                                citiesId: [1]
                            }).then((response) => {
                            expect(response.body.token).not.toBe(null)
                            resolve(
                                requester.get('/api/masters').then((response) => {
                                    const master = response.body.rows.find(master => master.email === "some@valid.email")
                                    expect(master.email).toBe("some@valid.email")
                                    masterId = master.id
                                })
                            )
                        })
                    })
                })
            })
            afterEach(() => {
                return new Promise((resolve, reject) => {
                    resolve(requester.delete(`/api/masters/${masterId}`)
                        .set('Authorization', `Bearer ${token}`).then((response) => {
                            expect(response.body.message).toBe(`master with id:${masterId} was deleted`)
                        })
                    )
                })
            })
            test('change to valid email', () => {
                return new Promise((resolve, reject) => {
                    requester.post(`/api/auth/login`)
                        .send({
                            email: "some@valid.email",
                            password: 123456
                        }).then((response) => {
                        const masterToken = response.body.token
                        resolve(
                            requester.put(`/api/masters/changeEmail`)
                                .set('Authorization', `Bearer ${masterToken}`)
                                .send({
                                    password: 123456,
                                    currentEmail: "some@valid.email",
                                    newEmail: "some@valid2.com"
                                }).then((response) => {
                                expect(response.body).not.toBe(null)
                            })
                        )
                    })
                })
            },10000)
            test('change to not valid email', () => {
                return new Promise((resolve, reject) => {
                    requester.post(`/api/auth/login`)
                        .send({
                            email: "some@valid.email",
                            password: 123456
                        }).then((response) => {
                        const masterToken = response.body.token
                        resolve(
                            requester.put(`/api/masters/changeEmail`)
                                .set('Authorization', `Bearer ${masterToken}`)
                                .send({
                                    password: 123456,
                                    currentEmail: "some@valid.email",
                                    newEmail: "somevalid.com"
                                }).then((response) => {
                                expect(response.body.errors[0].msg).toBe('email must be a valid email format')
                            })
                        )
                    })
                })
            },10000)
            test('change random email', () => {
                return new Promise((resolve, reject) => {
                    requester.post(`/api/auth/login`)
                        .send({
                            email: "some@valid.email",
                            password: 123456
                        }).then((response) => {
                        const masterToken = response.body.token
                        resolve(
                            requester.put(`/api/masters/changeEmail`)
                                .set('Authorization', `Bearer ${masterToken}`)
                                .send({
                                    password: 123456,
                                    currentEmail: "Random@valid.randomEmail",
                                    newEmail: "someRandom@valid.email"
                                }).then((response) => {
                                expect(JSON.parse(response.body.message).msg).toBe('Master is not found or password is wrong')
                            })
                        )
                    })
                })
            },10000)
        })
    })
    describe('order controller', () => {
        describe('create order', () => {
            let token: string
            let masterId: string
            const date = new Date(Date.now())
            date.setDate(date.getDate() + 20)
            beforeAll(() => {
                return new Promise((resolve, reject) => {
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
            },10000)
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
            },10000)
        })
    })
})

/*}
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
})*/


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

