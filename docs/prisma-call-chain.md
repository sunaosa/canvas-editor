# Prisma 调用链路

> 项目采用经典三层架构：**Route（接口层）→ Service（业务层）→ Repository（数据层）→ PrismaClient（ORM）**。
> 上层只依赖直接下层，Route 不直接碰 `prisma`，Repository 不含业务逻辑。

## 一、整体链路图

```
┌─────────────────────────── API 接口层 src/app/api ───────────────────────────┐
│                                                                              │
│  POST /api/auth/register ──┐                                                 │
│  POST /api/auth/login ─────┤                                                 │
│  GET  /api/auth/me ────────┼──► userService          (src/server/services)   │
│                            │        │                                       │
│  GET  /api/chat ───────────┴──► requireAuth ──► userService.getByUuid       │
│                                        (src/server/utils/require-auth.ts)    │
└────────────────────────────────────────┬─────────────────────────────────────┘
                                         │ 只依赖 userRepository
┌────────────────────────── 业务层 src/server/services ─────────┼──────────────┐
│  userService (user-service.ts)         │                      │              │
│    ├─ register()   注册:查重 + bcrypt 哈希 + 创建 + 签发 JWT    │              │
│    ├─ login()      登录:查询 + 验密 + 更新登录信息 + 签发 JWT   │              │
│    └─ getByUuid()  token 换用户(给 /me 和 requireAuth 用) ─────┤              │
└──────────────────────────────────────┬─────────────────────────┘              │
                                       ▼                                       
┌────────────────────────── 数据层 src/server/db ──────────────────────────────┐
│  userRepository (user.ts) —— 只做 CRUD 封装,不含业务逻辑                     │
│    findById / findByUuid / findByUsername / findByEmail                      │
│    findByUsernameOrEmail / create / updateLoginInfo                          │
│                                         │                                    │
│                                         ▼                                    │
│  prisma 单例 (prisma.ts) ── PrismaPg 驱动适配器 ── DATABASE_URL ──► PostgreSQL│
│                                       8.133.177.18:5432 / canvas_db         │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 二、各文件职责

| 文件 | 层 | 职责 |
|---|---|---|
| [src/app/api/auth/*/route.ts](../src/app/api/auth) | 接口层 | 参数校验（zod）、调 service、组装响应、写 Cookie |
| [src/server/utils/require-auth.ts](../src/server/utils/require-auth.ts) | 接口层 | 受保护 API 统一鉴权：验 JWT + 查库确认账号有效 |
| [src/server/services/user-service.ts](../src/server/services/user-service.ts) | 业务层 | 业务规则（查重、密码哈希、账号状态检查）、P2002 竞态兜底、签发 JWT |
| [src/server/db/user.ts](../src/server/db/user.ts) | 数据层 | 纯 CRUD 封装，一个方法对应一个 `prisma.user.*` 调用 |
| [src/server/db/prisma.ts](../src/server/db/prisma.ts) | 连接层 | PrismaClient 单例，通过 PrismaPg 适配器连接 PG |
| [prisma/schema.prisma](../prisma/schema.prisma) | 定义层 | `users` 表模型（12 列），`@map` 映射蛇形列名 |

## 三、每条接口的完整调用链

### 1. 注册 `POST /api/auth/register`

```
route.ts POST
  └─ userService.register(input)
       ├─ userRepository.findByUsername()          → prisma.user.findUnique({ where: { username } })
       │    └─ 已存在 → throw USERNAME_TAKEN
       ├─ userRepository.findByEmail()             → prisma.user.findUnique({ where: { email } })   (填了邮箱才查)
       │    └─ 已存在 → throw EMAIL_TAKEN
       ├─ hashPassword()                           (bcrypt,不走数据库)
       ├─ userRepository.create()                  → prisma.user.create()
       │    └─ 撞唯一约束 P2002 → throw USERNAME_TAKEN (并发竞态兜底)
       └─ finalizeAuth() → signToken() + toSafeUser()
```

### 2. 登录 `POST /api/auth/login`

```
route.ts POST
  └─ userService.login(input, ip)
       ├─ userRepository.findByUsernameOrEmail()   → prisma.user.findFirst({ where: { OR: [username, email] } })
       │    └─ 不存在 → 对假哈希跑一次 bcrypt(防时序枚举用户名) → throw INVALID_CREDENTIALS
       ├─ user.status === 0 → throw ACCOUNT_DISABLED
       ├─ verifyPassword()                         (bcrypt 比对)
       │    └─ 不匹配 → throw INVALID_CREDENTIALS
       ├─ userRepository.updateLoginInfo(id, ip)   → prisma.user.update({ lastLoginAt, lastLoginIp })
       └─ finalizeAuth() → 签发 JWT + SafeUser
```

### 3. 当前用户 `GET /api/auth/me`

```
route.ts GET
  ├─ extractToken() + verifyToken()                (JWT 校验,不走数据库)
  └─ userService.getByUuid(payload.sub)
       └─ userRepository.findByUuid()              → prisma.user.findUnique({ where: { uuid } })
            └─ route 层再检查 status === 0 → 401
```

### 4. 聊天 `GET /api/chat`（受保护接口示例）

```
route.ts GET
  └─ requireAuth(request)
       ├─ extractToken() + verifyToken()           (JWT 校验)
       └─ userService.getByUuid(payload.sub)
            └─ userRepository.findByUuid()         → prisma.user.findUnique({ where: { uuid } })
                 └─ 不存在或 status === 0 → null → route 层返回 401
```

> 注意：`proxy.ts` 只拦截"没有 token"的请求、不验签；真正的鉴权（验签 + 查库）在 `requireAuth`，所以每个受保护 route 内都必须调用它。

## 四、Repository → Prisma → SQL 对应表

| userRepository 方法 | Prisma 调用 | 大致 SQL | 被谁调用 |
|---|---|---|---|
| `findById(id)` | `prisma.user.findUnique({ where: { id } })` | `SELECT * FROM users WHERE id = $1` | （暂未被业务使用，预留） |
| `findByUuid(uuid)` | `prisma.user.findUnique({ where: { uuid } })` | `SELECT * FROM users WHERE uuid = $1` | `getByUuid` ← `/me`、`requireAuth` |
| `findByUsername(u)` | `prisma.user.findUnique({ where: { username } })` | `SELECT * FROM users WHERE username = $1` | `register` 查重 |
| `findByEmail(e)` | `prisma.user.findUnique({ where: { email } })` | `SELECT * FROM users WHERE email = $1` | `register` 查重 |
| `findByUsernameOrEmail(v)` | `prisma.user.findFirst({ where: { OR: [...] } })` | `SELECT * FROM users WHERE username = $1 OR email = $1 LIMIT 1` | `login` |
| `create(data)` | `prisma.user.create({ data })` | `INSERT INTO users ...` | `register` |
| `updateLoginInfo(id, ip)` | `prisma.user.update({ where: { id }, data })` | `UPDATE users SET last_login_at/last_login_ip WHERE id = $1` | `login` |

## 五、底层连接链路（prisma.ts）

```
createPrismaClient()
  ├─ process.env.DATABASE_URL                     ← 缺失时模块加载即抛错
  ├─ new PrismaPg({ connectionString })           ← Prisma 7 驱动适配器(不再用内置引擎直连)
  └─ new PrismaClient({ adapter, log })
       │
globalThis.prisma ?? createPrismaClient()         ← dev 热重载时防止重复建连(单例缓存)
```

环境变量加载来源：

- **应用运行时（Next.js）**：自动读取 `.env.local`
- **Prisma CLI（migrate / db pull 等）**：由 [prisma.config.ts](../prisma.config.ts) 显式加载 `.env` + `.env.local`（后者优先，与应用一致）

## 六、扩展约定

新增数据表/模型时按同样的分层走：

1. `schema.prisma` 建模 → `pnpm exec prisma generate`
2. `src/server/db/<table>.ts` 建 repository（只写 CRUD）
3. `src/server/services/<domain>-service.ts` 写业务逻辑
4. route 里只调 service，禁止直接 import `prisma`
