import { FindOneOptions } from "typeorm";
import { Ayuda } from "../entities/ayuda.entity";

export const AyudaFormsTemplate: FindOneOptions<Ayuda> = {
    select: {
        id: true,
        nombre: true
    },
    where: {
        esPropio: false
    }
}