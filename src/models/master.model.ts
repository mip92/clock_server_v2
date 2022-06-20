import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";


export interface MasterAttributes {
    id: number;
    email: string;
    name: string;
    role: string;
    password: string;
    activationLink: string;
    isActivated: boolean;
    rating: number;
    isApproved: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface MasterModel extends Model<Partial<MasterAttributes>>, MasterAttributes {
}

export class Master extends Model<MasterModel, MasterAttributes> {
}

export type MasterStatic = typeof Model & {
    new(values?: object, options?: BuildOptions): MasterModel;
};

export function MasterFactory(sequelize: Sequelize): MasterStatic {
    return <MasterStatic>sequelize.define("master", {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        name: {type: DataTypes.STRING, allowNull: false},
        email: {type: DataTypes.STRING, unique: true, allowNull: false},
        rating: {type: DataTypes.FLOAT, allowNull: false, defaultValue: 5},
        role: {type: DataTypes.STRING, defaultValue: "MASTER"},
        password: {type: DataTypes.STRING, unique: false, allowNull: false},
        activationLink: {type: DataTypes.STRING, allowNull: true},
        isActivated: {type: DataTypes.BOOLEAN, defaultValue: false},
        isApproved: {type: DataTypes.BOOLEAN, defaultValue: false},
    });
}