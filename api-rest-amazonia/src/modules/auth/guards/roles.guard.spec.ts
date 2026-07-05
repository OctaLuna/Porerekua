import { RolesGuard } from './roles.guard';
import { OptionalJwtAuthGuard } from './optional-jwt.guard';
import { RoleEnum } from 'src/shared/enums/role.enum';
import { MyForbiddenException, MyUnauthorizedException } from 'src/shared/exceptions';

const ctxWith = (user: any, roles?: RoleEnum[]) => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(roles) } as any;
    const context = {
        getHandler: () => null,
        getClass: () => null,
        switchToHttp: () => ({ getRequest: () => ({ user }) }),
    } as any;
    return { reflector, context };
};

describe('RolesGuard (jerarquía Superadmin>Admin>Investigador)', () => {
    it('permite si no hay roles requeridos', () => {
        const { reflector, context } = ctxWith(null, undefined);
        expect(new RolesGuard(reflector).canActivate(context)).toBe(true);
    });

    it('Admin (2) accede a endpoint que requiere Admin (2)', () => {
        const { reflector, context } = ctxWith({ rol: RoleEnum.Admin }, [RoleEnum.Admin]);
        expect(new RolesGuard(reflector).canActivate(context)).toBe(true);
    });

    it('Superadmin (1) accede a endpoint que requiere Admin (2)', () => {
        const { reflector, context } = ctxWith({ rol: RoleEnum.Superadmin }, [RoleEnum.Admin]);
        expect(new RolesGuard(reflector).canActivate(context)).toBe(true);
    });

    it('Investigador (3) NO accede a endpoint que requiere Admin (2)', () => {
        const { reflector, context } = ctxWith({ rol: RoleEnum.Investigador }, [RoleEnum.Admin]);
        expect(() => new RolesGuard(reflector).canActivate(context)).toThrow(MyForbiddenException);
    });

    it('sin usuario lanza Forbidden', () => {
        const { reflector, context } = ctxWith(null, [RoleEnum.Admin]);
        expect(() => new RolesGuard(reflector).canActivate(context)).toThrow(MyForbiddenException);
    });
});

describe('OptionalJwtAuthGuard', () => {
    const makeCtx = (authorization?: string) =>
        ({ switchToHttp: () => ({ getRequest: () => ({ headers: authorization ? { authorization } : {} }) }) } as any);

    it('JWT inactivo ⇒ pasa siempre', () => {
        const guard = new OptionalJwtAuthGuard({ get: () => ({ isActive: false }) } as any);
        expect(guard.canActivate(makeCtx())).toBe(true);
    });

    it('JWT activo y sin header Authorization ⇒ pasa (acceso público)', () => {
        const guard = new OptionalJwtAuthGuard({ get: () => ({ isActive: true }) } as any);
        expect(guard.canActivate(makeCtx())).toBe(true);
    });

    it('handleRequest sin user lanza Unauthorized', () => {
        const guard = new OptionalJwtAuthGuard({ get: () => ({ isActive: true }) } as any);
        expect(() => guard.handleRequest(null, null)).toThrow(MyUnauthorizedException);
    });

    it('handleRequest con user lo devuelve', () => {
        const guard = new OptionalJwtAuthGuard({ get: () => ({ isActive: true }) } as any);
        expect(guard.handleRequest(null, { sub: 1 })).toEqual({ sub: 1 });
    });
});
