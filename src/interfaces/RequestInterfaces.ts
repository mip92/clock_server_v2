import {Params, Query} from "express-serve-static-core";
import fileUpload from "express-fileupload";

export interface LoginBody {
    email: string,
    password: string,
}

export interface AuthRegistrationBody {
    firstPassword: string,
    secondPassword: string,
    isRulesChecked: boolean,
    isMaster: boolean,
    email: string,
    name: string,
    citiesId?: number[],
}

export interface CreateCityBody {
    city: string
    price: number
}

export interface UpdateCityBody {
    cityName: string
    price: number
}

export interface CreateMasterBody {
    name: string,
    email: string,
    citiesId: string
}

export interface UpdateMasterBody {
    id: number,
    name: string,
    email: string,
    citiesId: string,
}

export type GetFreeMastersQuerry ={
    cityId: string,
    dateTime: string,
    clockSize: string,
    limit:string,
    offset: string

}

export interface ChangeEmailBody {
    password: string,
    currentEmail: string,
    newEmail: string
}

export type GetAllMastersQuery = {
    limit?: string,
    offset?: string,
    cities?: string,
    sortBy?: string,
    select?: string,
    filter?: string
}
export type MasterId = { masterId: string }
export type CityIdType = { cityId: string }
export type LimitOffsetType = {
    limit?: string,
    offset?: string,
    sortBy?: string,
    select?: string,
    filter?: string
}
export type Link = { link: string }

export interface CreateOrderBody {
    cityId: number,
    clockSize: number,
    dateTime: Date,
    email: string,
    masterId: number,
    name: string
}

export type GetAllOrders = {
    limit?: string,
    offset?: string,
    masterId?: string
    userId?: string
    cities?: string,
    sortBy?: string,
    select?: string,
    filterMaster?: string,
    filterUser?: string,
    minDealPrice?: string,
    maxDealPrice?: string,
    minTotalPrice?: string,
    maxTotalPrice?: string,
    dateStart?: string,
    dateFinish?: string,
    clockSize?: string,
    status?: string
}


export interface DeletePicturesBody {
    picturesId: number[]
}

export type GetOrderByDate ={
    masterId: string
    cities: string,
    dateStart? :string,
    dateFinish? :string,
}

export type GetOrderByCity ={
    dateStart? :string,
    dateFinish? :string,
}
export type GetOneOrderParams={orderId:string}
export type CreatePicturesParams={orderId:string}
export interface DeletePicturesBody{picturesId: number[]}


export interface CreateUserBody {
    email: string,
    name: string
}

export type FindUserQuery = { email: string }
export type GetOneUserParams = { userId: string }

export interface UpdateUserBody {
    id: number,
    newEmail: string,
    newName: string
}

export type DeleteUserParams = {
    userId: string
}

export interface CreateRatingBody {
    key: string,
    rating: number,
    comment: string
}

export type GetRatingByMasterParams ={ masterId:string }
export type LinkParams ={ link:string }
export interface CreatePayPalOrderBody {
    payPalOrderId: string
}



// @ts-ignore
export interface CustomRequest<U, T extends Params | null,
    C extends Query | null, K extends FileList | null> extends Express.Request {
    body: U,
    params: T,
    query: C,
    files: K | (& fileUpload.FileArray) | (& undefined); //k
}
