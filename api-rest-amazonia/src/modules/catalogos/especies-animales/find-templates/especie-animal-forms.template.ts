import { FindOneOptions } from "typeorm";
import { EspecieAnimal } from "../entities/especie-animal.entity";

export const EspecieAnimalFormsTemplate: FindOneOptions<EspecieAnimal> = {
    select: {
        id: true,
        nombre: true
    },
    where: {
        esPropio: false
    }
}