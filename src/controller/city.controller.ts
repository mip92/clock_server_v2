import {
    CityIdType,
    CreateCityBody,
    CustomRequest,
    LimitOffsetType,
    UpdateCityBody
} from "../interfaces/RequestInterfaces";
import {NextFunction, Response} from "express";
import {CityModel} from "../models/city.model";
import {Attributes, FindAndCountOptions} from "sequelize";
import {City} from '../models';
import Sequelize from 'sequelize';
import ApiError from '../exeptions/api-error';

class CityController {
    async createCity(req: CustomRequest<CreateCityBody, null, null, null>, res: Response, next: NextFunction) {
        try {
            const {city, price} = req.body
            const isCityUniq: CityModel | null = await City.findOne({where: {cityName: city}})
            if (isCityUniq) return next(ApiError.ExpectationFailed({
                value: city,
                msg: `City with this name: ${city} is not unique`,
                param: "city",
                location: "body"
            }))
            const newCity = await City.create({cityName: city, price})
            res.status(201).json(newCity)
        } catch (e) {
            next(ApiError.Internal(`server error`))
        }
    }

    async getCities(req: CustomRequest<null, null, LimitOffsetType, null>, res: Response, next: NextFunction) {
        try {
            const {limit, offset, sortBy, select, filter} = req.query
            const options: Omit<FindAndCountOptions<Attributes<CityModel>>, "group"> = {}
            options.where = {}
            if ((filter !== '') && (filter != undefined) && filter) options.where = {cityName: {[Sequelize.Op.iLike]: `%${filter}%`}}
            if (limit && +limit > 50) options.limit = 50
            if (!offset) options.offset = 0
            if (sortBy && select) options.order = [[sortBy, select]]
            //options.order = [['createdAt', 'ASC']]
            const cities: { rows: CityModel[]; count: number; } = await City.findAndCountAll(options)
            if (!cities) return next(ApiError.BadRequest("Сities not found"))
            res.status(200).json(cities)
        } catch (e) {
            console.log(e)
            next(ApiError.Internal(`server error`))
        }
    }

    async getOneCity(req: CustomRequest<null, CityIdType, null, null>, res: Response, next: NextFunction) {
        try {
            const {cityId} = req.params
            const city: CityModel | null = await City.findOne({where: {id: +cityId}})
            res.status(200).json(city)
        } catch (e) {
            next(ApiError.Internal(`server error`))
        }
    }

    async updateCity(req: CustomRequest<UpdateCityBody, CityIdType, null, null>, res: Response, next: NextFunction) {
        try {
            const {cityId} = req.params
            const {cityName, price} = req.body
            const city: CityModel | null = await City.findOne({where: {id: +cityId}})
            if (!city) return next(ApiError.ExpectationFailed({
                value: cityId,
                msg: `City with this id: ${cityId} is not found`,
                param: "cityName",
                location: "body"
            }))
            await city.update({cityName, price})
            res.status(200).json(city)
        } catch (e) {
            next(ApiError.Internal(`server error`))
        }
    }

    async deleteCity(req: CustomRequest<null, CityIdType, null, null>, res: Response, next: NextFunction) {
        try {
            const {cityId} = req.params
            if (!cityId) next(ApiError.BadRequest("id is not defined"))
            const candidate: CityModel | null = await City.findOne({where: {id: cityId}})
            if (!candidate) next(ApiError.BadRequest(`city with id:${cityId} is not defined`))
            await City.destroy({where: {id: cityId}})
            res.status(200).json({message: `city with id:${cityId} was deleted`, city: candidate})
        } catch (e) {
            next(ApiError.Internal(`server error`))
        }
    }
}

export default new CityController()