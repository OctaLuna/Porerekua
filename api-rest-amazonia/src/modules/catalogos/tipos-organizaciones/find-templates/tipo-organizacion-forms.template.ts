import { FindOneOptions } from "typeorm";
import { TipoOrganizacion } from "../entities/tipo-organizacion.entity";

export const TipoOrganizacionFormsTemplate: FindOneOptions<TipoOrganizacion> = {
    select: {
        id: true,
        nombre: true,
    },
    where: {
        esPropio: false
    }
}