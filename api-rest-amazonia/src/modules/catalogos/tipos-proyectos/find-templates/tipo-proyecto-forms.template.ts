import { FindOneOptions } from "typeorm";
import { TipoProyecto } from "../entities/tipo-proyecto.entity";

export const TipoProyectoFormsTemplate: FindOneOptions<TipoProyecto> = {
    select: {
        id: true,
        nombre: true
    },
    where: {
        esPropio: false
    }
}