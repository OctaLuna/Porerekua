import { FindOneOptions } from "typeorm";
import { PracticaAgricola } from "../entities/practica-agricola.entity";

export const PracticasAgricolasFormsTemplate: FindOneOptions<PracticaAgricola> = {
    select: {
        id: true,
        nombre: true
    },
    where: {
        esPropio: false
    }
}