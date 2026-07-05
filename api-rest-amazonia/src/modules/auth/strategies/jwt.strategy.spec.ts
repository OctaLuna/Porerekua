import { JwtStrategy } from './jwt.strategy';
import { MyUnauthorizedException } from 'src/shared/exceptions/my-unauthorized.exception';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { RoleEnum } from 'src/shared/enums/role.enum';

// AUDIT-008: la invalidación inmediata de tokens vía `token_valid_from` ya
// está implementada. Estos tests fijan el comportamiento esperado.
describe('JwtStrategy.validate (AUDIT-008)', () => {
    const jwtConfig = { get: () => ({ secret: 'test-secret' }) } as any;
    let repo: { findOne: jest.Mock };
    let strategy: JwtStrategy;

    const basePayload = (iatMs: number): JwtPayload => ({
        sub: 1,
        email: 'u@kaaiya.test',
        rol: RoleEnum.Admin,
        nombre: 'U',
        fechaExpiracion: null,
        iat: Math.floor(iatMs / 1000),
    });

    beforeEach(() => {
        repo = { findOne: jest.fn() };
        strategy = new JwtStrategy(jwtConfig, repo as any);
    });

    it('acepta token válido de usuario activo sin revocación', async () => {
        repo.findOne.mockResolvedValue({ id: 1, activo: true, tokenValidFrom: null });
        await expect(strategy.validate(basePayload(Date.now()))).resolves.toMatchObject({ sub: 1 });
    });

    it('rechaza si la cuenta está desactivada', async () => {
        repo.findOne.mockResolvedValue({ id: 1, activo: false, tokenValidFrom: null });
        await expect(strategy.validate(basePayload(Date.now()))).rejects.toBeInstanceOf(
            MyUnauthorizedException,
        );
    });

    it('rechaza token emitido ANTES de tokenValidFrom (revocado)', async () => {
        const now = Date.now();
        repo.findOne.mockResolvedValue({
            id: 1,
            activo: true,
            tokenValidFrom: new Date(now), // revocado ahora
        });
        // token emitido hace 1 hora ⇒ inválido
        await expect(strategy.validate(basePayload(now - 3600_000))).rejects.toBeInstanceOf(
            MyUnauthorizedException,
        );
    });

    it('rechaza acceso de investigador expirado', async () => {
        const payload = { ...basePayload(Date.now()), fechaExpiracion: new Date(Date.now() - 1000).toISOString() };
        await expect(strategy.validate(payload)).rejects.toBeInstanceOf(MyUnauthorizedException);
    });
});
