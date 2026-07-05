import { FindOneOptions } from "typeorm";
import { Motivo } from "../entities/motivo.entity";

export const motivoFormsTemplate: FindOneOptions<Motivo> = {
    select: {
        id: true,
        nombre: true
    },
    where: {
        esPropio: false
    }
}