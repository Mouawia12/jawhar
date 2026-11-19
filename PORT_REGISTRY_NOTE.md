# منافذ المشروع — PORT REGISTRY NOTE

منافذ هذا المشروع محجوزة في السجل المرجعي للجهاز:
`/Users/mwyoumbai/Downloads/DEV_PORT_REGISTRY.md` (القسم 17 — jawhar)

| المنفذ | الخدمة |
|---:|---|
| **3030** | `apps/web` — واجهة المتجر (Next.js) |
| **3031** | `apps/api` — Payload CMS: لوحة الإدارة + REST API |
| 5432 | PostgreSQL (Homebrew، مشترك) — القاعدة `jawhar` |

لا تستعمل 3000/3001: محجوزان لـ transAllal. راجع السجل قبل تغيير أي منفذ، وحدّث معاً:
`apps/*/package.json` و`apps/api/.env` و`apps/web/.env.local` و`.claude/launch.json`.
