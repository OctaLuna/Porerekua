import { ProyectosService } from './proyectos.service';
import { AreasEnum } from 'src/shared/enums/areas.enum';
import { CreateProyectoDto } from '../dto/create-proyecto.dto';

// AUDIT-009: GeoRef se resuelve FUERA de la transacción y se pasa pre-resuelto
// a create(). Estos tests verifican el flujo de enriquecimiento.
describe('ProyectosService — GeoRef pre-resuelto (AUDIT-009)', () => {
    let service: ProyectosService;
    let repo: { save: jest.Mock; update: jest.Mock };
    let georef: { resolveCoordinates: jest.Mock };

    const noop = { createMany: jest.fn().mockResolvedValue(undefined) };

    const baseData = (): CreateProyectoDto =>
        ({
            nombre: 'audit-test Proyecto',
            descripcion: 'd',
            anioInicio: 2024,
            area: AreasEnum.desarrollo,
            tipo: { id: 5 },
            municipiosTrabajo: [{ idMunicipio: 1 }],
            ayudas: { seleccionados: [1] },
            actores: { seleccionados: [1] },
            desarrollo: { seleccionados: [1] },
            lat: -17.78,
            lng: -63.18,
        } as unknown as CreateProyectoDto);

    beforeEach(() => {
        repo = { save: jest.fn().mockImplementation((p) => ({ ...p, id: 99 })), update: jest.fn() };
        georef = { resolveCoordinates: jest.fn() };
        service = new ProyectosService(
            repo as any, // proyectoRepository
            {} as any, // imagenRepository
            { findOneOrCreate: jest.fn().mockResolvedValue({ id: 5 }) } as any, // tiposProyectos
            noop as any, // localidades
            noop as any, // ayudas
            noop as any, // actores
            noop as any, // conservacionAnimales
            noop as any, // conservacionAgricolas
            noop as any, // comunidadesIndigenasAreas
            {} as any, // upload
            georef as any, // georefService
        );
    });

    it('resolveRegionFor devuelve null sin coordenadas', async () => {
        expect(await service.resolveRegionFor({ lat: undefined, lng: undefined })).toBeNull();
        expect(georef.resolveCoordinates).not.toHaveBeenCalled();
    });

    it('resolveRegionFor llama a GeoRef con coordenadas', async () => {
        georef.resolveCoordinates.mockResolvedValue({ found: true, department: 'Santa Cruz' });
        const r = await service.resolveRegionFor({ lat: -17.78, lng: -63.18 });
        expect(georef.resolveCoordinates).toHaveBeenCalled();
        expect(r).toMatchObject({ department: 'Santa Cruz' });
    });

    it('create() con región pre-resuelta NO vuelve a llamar a GeoRef y persiste el departamento', async () => {
        await service.create(baseData(), undefined, {
            region: { found: true, lat: -17.78, lng: -63.18, department: 'Santa Cruz', municipality: 'Andrés Ibáñez', country: 'Bolivia' },
        });
        expect(georef.resolveCoordinates).not.toHaveBeenCalled();
        expect(repo.update).toHaveBeenCalledWith(99, expect.objectContaining({
            department: 'Santa Cruz', municipality: 'Andrés Ibáñez', georefFailed: false,
        }));
    });

    it('create() con región pre-resuelta null marca georefFailed=true (degradación)', async () => {
        await service.create(baseData(), undefined, { region: null });
        expect(georef.resolveCoordinates).not.toHaveBeenCalled();
        expect(repo.update).toHaveBeenCalledWith(99, { georefFailed: true });
    });

    it('create() sin pre-resolución mantiene compatibilidad (llama a GeoRef)', async () => {
        georef.resolveCoordinates.mockResolvedValue(null);
        await service.create(baseData());
        expect(georef.resolveCoordinates).toHaveBeenCalled();
    });
});
