import { CreateTiposOrganizacioneDto } from "src/modules/catalogos/tipos-organizaciones/dto/create-tipos-organizacione.dto"

export class CreateOrganizacioneDto {
    nombre: string
    idDepartamento: number
    esNacional: boolean
    tipo: CreateTiposOrganizacioneDto
    anioInicioTrabajo: number
}
