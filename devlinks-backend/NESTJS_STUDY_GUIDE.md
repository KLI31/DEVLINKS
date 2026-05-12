# NestJS Backend — Guía de Estudio

Basada en el proyecto DevLinks. Cubre los conceptos exactos que ya usas y los que necesitas dominar para construir backends robustos con NestJS.

---

## 1. Arquitectura de NestJS

NestJS organiza el código en **módulos**. Cada módulo encapsula su dominio: controladores, servicios, guards, estrategias.

```
AppModule
├── ConfigModule (global)
├── PrismaModule
├── RedisModule
└── AuthModule
    ├── AuthController
    ├── AuthService
    ├── JwtStrategy
    ├── GithubStrategy
    ├── JwtAuthGuard
    └── GithubAuthGuard
```

**Qué estudiar:**
- `@Module({ imports, controllers, providers, exports })` — cómo conectar piezas
- `forRoot()` vs `forFeature()` en módulos externos (ConfigModule, JwtModule)
- `isGlobal: true` — cuándo usarlo y sus implicaciones
- Módulos dinámicos — cómo funcionan internamente (ej. `ConfigModule.forRoot`)

---

## 2. Inyección de Dependencias (DI)

Es el corazón de NestJS. Los servicios se inyectan en constructores automáticamente.

```ts
// Lo que ya tienes en AuthService
constructor(
  private readonly prisma: PrismaService,
  private readonly jwtService: JwtService,
  private readonly config: ConfigService,
) {}
```

**Qué estudiar:**
- `@Injectable()` — cómo NestJS registra proveedores
- Alcances: `DEFAULT` (singleton), `REQUEST`, `TRANSIENT` — cuándo cada uno importa
- Inyectar tokens personalizados con `@Inject(TOKEN)`
- Circular dependencies y cómo resolverlas con `forwardRef()`

---

## 3. Controllers y Decoradores de Rutas

```ts
@Controller('auth')           // prefijo base: /auth
export class AuthController {
  @Post('login')              // POST /auth/login
  @HttpCode(HttpStatus.CREATED)
  async login(@Body() dto: LoginAuthDto, @Res({ passthrough: true }) res: Response) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: any) {}
}
```

**Qué estudiar:**
- `@Param()`, `@Query()`, `@Body()`, `@Headers()`, `@Req()`, `@Res()`
- `passthrough: true` en `@Res()` — permite usar `res.cookie()` sin perder el manejo de respuesta de NestJS
- `@HttpCode()` — cuándo cambiarlo (POST suele retornar 201, logout debería ser 200)
- Route params: `@Get(':id')` con `@Param('id')`

---

## 4. DTOs y Validación

**Bug que tuviste:** `RefreshDto` tenía `refreshToken` como obligatorio, y el endpoint de logout lo usaba sin recibir body → `ValidationPipe` lanzaba 400 antes de que el controller corriera.

```ts
// DTO con validación
export class LoginAuthDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

// ValidationPipe global en main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,           // elimina campos no declarados en el DTO
  forbidNonWhitelisted: true, // lanza error si vienen campos extra
  transform: true,           // convierte tipos automáticamente (string → number)
}));
```

**Qué estudiar:**
- `class-validator`: `@IsString`, `@IsEmail`, `@IsOptional`, `@MinLength`, `@IsEnum`, `@IsUUID`
- `class-transformer`: `@Transform`, `@Exclude`, `@Expose` para serializar respuestas
- `@IsOptional()` — cómo hacer campos opcionales en DTOs de update (PATCH)
- `PartialType(CreateDto)` de `@nestjs/mapped-types` — patrón estándar para DTOs de update

---

## 5. Guards y Autenticación con Passport

Los guards deciden si una request puede proceder. Corren **antes** del controller.

```ts
// Lo que tienes — extiende AuthGuard de Passport
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    if (err || !user) throw new UnauthorizedException('Token inválido o expirado');
    return user; // se adjunta a req.user
  }
}
```

**Bug que tuviste:** `JwtStrategy` usaba `ExtractJwt.fromAuthHeaderAsBearerToken()` pero el frontend enviaba el token en cookies, no en el header `Authorization`. El guard siempre fallaba.

**Corrección para leer desde cookie:**
```ts
// En JwtStrategy
super({
  jwtFromRequest: (req) => req?.cookies?.accessToken ?? null,
  ignoreExpiration: false,
  secretOrKey: configService.get('JWT_SECRET'),
  passReqToCallback: true,
});
```

**Qué estudiar:**
- `ExecutionContext` — cómo extraer `Request` desde guards
- `@Public()` decorator con guard global — patrón para marcar rutas públicas
- `CanActivate` interface — para guards custom sin Passport
- Diferencia entre `AuthGuard` de Passport vs `CanActivate` puro

---

## 6. Estrategias Passport

```ts
// JWT Strategy — valida el accessToken
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }
  validate(payload: JwtPayload): JwtValidatedUser {
    return { userId: payload.sub, email: payload.email };
    // lo que retornas aquí queda en req.user
  }
}
```

**Qué estudiar:**
- Cómo Passport inyecta el resultado de `validate()` en `req.user`
- `PassportStrategy(Strategy, 'nombre')` — el nombre es el que usas en `AuthGuard('nombre')`
- OAuth strategies (GitHub, Google) — `profile` object y cómo mapearlo a tu User
- `passReqToCallback: true` — para acceder a `req` dentro de `validate()`

---

## 7. Cookies y Seguridad HTTP

**Bug que tuviste:** `REFRESH_COOKIE` tenía `path: '/auth/refresh'`. Con el rewrite proxy de Next.js, el browser veía el path como `/api/auth/refresh`, no `/auth/refresh`, entonces la cookie nunca se enviaba al backend.

```ts
// Atributos importantes de cookies
const ACCESS_COOKIE = {
  httpOnly: true,   // no accesible desde JS del browser → protege contra XSS
  secure: process.env.NODE_ENV === 'production', // solo HTTPS en prod
  sameSite: 'lax',  // protege contra CSRF
  path: '/',
  maxAge: 15 * 60 * 1000, // ms
};
```

**Qué estudiar:**
- `HttpOnly` vs accesible por JS — cuándo usar cada uno
- `SameSite: strict | lax | none` — implicaciones para OAuth y CORS
- `Secure` — por qué es crítico en producción
- Diferencia entre `maxAge` y `expires` en cookies
- Cómo borrar una cookie: mismo `name`, `path` y `domain` con `maxAge: 0`
- `cookie-parser` en NestJS — necesario para leer `req.cookies`

---

## 8. JWT — Access + Refresh Token Pattern

El patrón que implementaste:

```
Login → genera accessToken (15min) + refreshToken (7d)
        ↓ ambos en cookies HttpOnly
Request → middleware verifica accessToken en cookie
        ↓ si expira → frontend llama /auth/refresh
Refresh → valida refreshToken en DB → genera nuevos tokens
        ↓ revoca el refreshToken usado (rotación)
Logout → revoca refreshToken en DB + borra ambas cookies
```

**Qué estudiar:**
- Por qué el accessToken corto (15min) y refreshToken largo (7d)
- Refresh token rotation — qué es y por qué previene token theft
- `jwtService.signAsync(payload, options)` vs `signSync`
- Blacklisting con Redis vs DB — trade-offs de performance
- `ignoreExpiration: false` — nunca ponerlo en `true` en producción

---

## 9. Prisma con NestJS

```ts
// PrismaService — patrón estándar
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}

// Uso en servicios
await this.prisma.refreshToken.updateMany({
  where: { token: refreshToken, isRevoked: false },
  data: { isRevoked: true },
});
```

**Qué estudiar:**
- `OnModuleInit` / `OnModuleDestroy` — lifecycle hooks de NestJS
- Prisma transactions: `this.prisma.$transaction([...])` — operaciones atómicas
- Prisma relations: `include`, `select`, nested writes
- Manejo de errores Prisma: `PrismaClientKnownRequestError` (código `P2002` = unique constraint)
- Soft delete pattern vs hard delete

---

## 10. Manejo de Errores

NestJS tiene exceptions built-in que se mapean a HTTP status codes:

```ts
throw new UnauthorizedException('Token inválido');  // 401
throw new ConflictException('Email ya en uso');      // 409
throw new NotFoundException('Usuario no encontrado'); // 404
throw new BadRequestException('Datos inválidos');    // 400
throw new ForbiddenException('Sin permiso');         // 403
```

**Qué estudiar:**
- `ExceptionFilter` — para customizar el formato de errores globalmente
- `HttpException` base class — para crear excepciones custom
- `@Catch(HttpException)` — filtros específicos por tipo de error
- Cómo evitar exponer stack traces en producción

---

## 11. CORS y Configuración de Producción

**Bug en tu proyecto:** `origin: '*'` con `credentials: true` es inválido — los browsers bloquean cookies cuando el origen es wildcard.

```ts
// Correcto para desarrollo
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // necesario para cookies cross-origin
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});
```

**Qué estudiar:**
- Por qué `credentials: true` requiere un `origin` específico (no `'*'`)
- Preflight requests (`OPTIONS`) y cómo NestJS las maneja
- Variables de entorno con `ConfigModule` — nunca hardcodear secrets
- `helmet()` — headers de seguridad HTTP para producción

---

## 12. Decoradores Personalizados

```ts
// Lo que tienes — extrae user de req
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// Uso
@Get('me')
@UseGuards(JwtAuthGuard)
getMe(@CurrentUser() user: JwtValidatedUser) {}
```

**Qué estudiar:**
- `createParamDecorator` — para decoradores de parámetro
- `SetMetadata` + `Reflector` — para decoradores que pasan metadata a guards
- Patrón `@Public()` con guard global que lee metadata

---

## Orden de Estudio Recomendado

1. **DI + Módulos** — es la base de todo NestJS
2. **Controllers + DTOs + ValidationPipe** — lo más usado día a día
3. **Guards + Strategies** — autenticación/autorización
4. **JWT pattern + Cookies** — seguridad de sesiones
5. **Prisma + transactions** — datos y consistencia
6. **Exception Filters** — errores limpios
7. **CORS + Helmet + ENV** — hardening para producción

---

## Recursos

- Documentación oficial: https://docs.nestjs.com
- `passport-jwt` docs: http://www.passportjs.org/packages/passport-jwt/
- Prisma + NestJS recipe: https://docs.nestjs.com/recipes/prisma
- OWASP JWT Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html
