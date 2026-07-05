import { FindOneOptions } from "typeorm";
import { ActorMunicipal } from "../entities/actor-municipal.entity";

export const ActorMunicipalFormsTemplate: FindOneOptions<ActorMunicipal> = {
    select: {
        id: true,
        nombre: true
    },
    where: {
        
    }
}