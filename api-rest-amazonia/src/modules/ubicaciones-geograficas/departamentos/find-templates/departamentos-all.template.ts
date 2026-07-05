import { FindOneOptions } from "typeorm";
import { Departamento } from "../entities/departamento.entity";

export const DepartamentosAllTemplate: FindOneOptions<Departamento> = {
    select: {
        id: true,
        nombre: true,
        municipios: {
            id: true,
            nombre: true,
            comunidadesIndigenas: {
                id: true,
                nombre: true
            }
        }
    },
    relations: {
        municipios: {
            comunidadesIndigenas: true
        }
    }
}