import { CreateFormasJuridicaDto } from "src/modules/catalogos/formas-juridicas/dto/inputs/create-formas-juridica.dto"
import { CreateApoyosEmpresaDto } from "../../apoyos-empresas/dto/create-apoyos-empresa.dto"
import { CreateMotivosEmpresaDto } from "../../motivos-empresas/dto/create-motivos-empresa.dto"

export class CreateEmpresaDto {
    nombre: string
    formaJuridica: CreateFormasJuridicaDto
    departamentos: number[]
    anioInicioApoyo: number
    apoyos: CreateApoyosEmpresaDto
    organizaciones?: string[]
    motivosApoyo: CreateMotivosEmpresaDto
    ods: number[]
}
