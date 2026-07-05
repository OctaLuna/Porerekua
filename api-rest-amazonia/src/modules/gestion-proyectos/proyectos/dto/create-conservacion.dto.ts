import { CreateConservacionAgricolaDto } from "src/modules/gestion-conservacion/conservacion-agricolas/dto/create-conservacion-agricola.dto";
import { CreateConservacionAnimaleDto } from "src/modules/gestion-conservacion/conservacion-animales/dto/create-conservacion-animale.dto";

export class CreateConservacionDto {
    especies: CreateConservacionAnimaleDto
    practicasAgricolas: CreateConservacionAgricolaDto
}