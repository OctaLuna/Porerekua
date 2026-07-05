import { FindOneOptions } from "typeorm";
import { FormaJuridica } from "../entities/forma-juridica.entity";

export const formaJuridicaFormsTemplate: FindOneOptions<FormaJuridica> = {
    select: {
        id: true,
        nombre: true,
    },
    where: {
        esPropio: false
    }
}