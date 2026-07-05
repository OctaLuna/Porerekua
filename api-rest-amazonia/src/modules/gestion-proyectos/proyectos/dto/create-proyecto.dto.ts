import { CreateTiposProyectoDto } from "src/modules/catalogos/tipos-proyectos/dto/create-tipos-proyecto.dto";
import { AreasEnum } from "src/shared/enums/areas.enum"
import { CreateLocalidadesProyectoDto } from "../../localidades-proyectos/dto/create-localidades-proyecto.dto";
import { CreateAyudasProyectoDto } from "../../ayudas-proyectos/dto/create-ayudas-proyecto.dto";
import { CreateActoresProyectoDto } from "../../actores-proyectos/dto/create-actores-proyecto.dto";
import { CreateComunidadesIndigenasAreaDto } from "src/modules/gestion-comunidades/comunidades-indigenas-areas/dto/create-comunidades-indigenas-area.dto";
import { CreateConservacionDto } from "./create-conservacion.dto";

export class CreateProyectoDto {
    fechaInicio: string;
    fechaFin?: string;
    nombre: string

    descripcion: string

    anioInicio: number

    anioFin?: number


    tipo: CreateTiposProyectoDto
    municipiosTrabajo: CreateLocalidadesProyectoDto[]   
    ayudas: CreateAyudasProyectoDto
    actores: CreateActoresProyectoDto

    area: AreasEnum
    conservacion?: CreateConservacionDto
    desarrollo?: CreateComunidadesIndigenasAreaDto

    lat?: number
    lng?: number
}
