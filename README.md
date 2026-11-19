# JAWHAR | جوهر

متجر للحرف الجزائرية التقليدية (الطرز التقرتي، السعف، الترميل)، مبني بأسلوب **API-first**: الواجهة لا تلمس قاعدة البيانات أبداً، وكل شيء يمر عبر REST API عام يمكن أن يستعمله لاحقاً تطبيق هاتف أو واجهة أخرى.

## البنية

```
jawhar/
├─ apps/api/          Payload CMS 3 + Next.js 16 — لوحة الإدارة + REST/GraphQL API   (المنفذ 3031)
├─ apps/web/          واجهة المتجر Next.js 16 + next-intl + Tailwind 4 (ar RTL / fr)   (المنفذ 3030)
└─ packages/shared/   العقد المشترك: مخطط الطلب (zod)، الثوابت، الولايات، أنواع TypeScript المولّدة
```

- قاعدة البيانات: PostgreSQL (محلياً عبر Homebrew، دون Docker).
- `packages/shared/src/payload-types.ts` يُولَّد من إعدادات الـ API (`pnpm generate:types`)، فتشترك كل الواجهات في نفس الأنواع.
- مخطط الطلب `checkoutSchema` نفسه يتحقق به المتصفح والـ API، ورسائل الخطأ رموز ثابتة (`phone_invalid`…) تترجمها كل واجهة.

## التشغيل محلياً

```bash
pnpm install
createdb jawhar                 # مرة واحدة
cp apps/api/.env.example apps/api/.env      # ثم املأ القيم
cp apps/web/.env.example apps/web/.env.local
pnpm seed                       # 58 ولاية (غير مفعلة) + الحرف الثلاث + مدير تجريبي محلي
pnpm seed:demo                  # اختياري: 4 قطع تجريبية موسومة + أسعار توصيل تجريبية لـ 3 ولايات
pnpm dev                        # api على 3031 و web على 3030
```

- لوحة الإدارة: http://localhost:3031/admin (بيانات المدير التجريبي في `apps/api/.env`).
- حذف كل البيانات التجريبية: `pnpm demo:clean` (لا يلمس أي بيانات حقيقية).
- الصور التجريبية: 8 صور بتراخيص حرة من Wikimedia Commons لحِرف مشابهة (القائمة والتراخيص في `apps/api/src/seed/demo-photos.ts`). تُنزَّل مرة واحدة إلى `apps/api/.demo-cache/` (خارج git)، ويظهر ذكر صاحبها تحت كل صورة. للمعاينة فقط، لا تُطلق بها المتجر.
- المنافذ مسجلة في `~/Downloads/DEV_PORT_REGISTRY.md` (انظر `PORT_REGISTRY_NOTE.md`).

## النشر (سيرفر Souftech — نسخة تجريبية)

| | الواجهة | الـ API ولوحة الإدارة |
|---|---|---|
| الدومين | https://jawhar.souftech.com | https://api-jawhar.souftech.com/admin |
| المجلد | `/home/user/web/jawhar.souftech.com/public_html` | `/home/user/web/api-jawhar.souftech.com/public_html` |
| المنفذ / PM2 | 3030 / `jawhar-web` | 3031 / `jawhar-api` |
| الإعدادات (غير متتبَّعة) | `apps/web/.env.production` | `apps/api/.env` |

- نفس طريقة السيرفر: HestiaCP، المستودع مستنسخ في `public_html` لكل دومين، و`.htaccess` غير متتبَّع يحوّل الطلبات إلى المنفذ. الواجهة لا تقبل إلا GET/HEAD، لأن الطلبات تذهب مباشرة إلى الـ API.
- Node 24 مثبّت منفصلاً في `/opt/node24` لهذا المشروع فقط، ونسخة Node 20 الخاصة بالمواقع الأخرى لم تُلمس. pnpm 11 داخل نفس المجلد.
- PostgreSQL: قاعدة `jawhar` ومستخدمها `jawhar` (خارج Hestia، فلا تدخل في نسخه الاحتياطية). كلمات المرور في `/root/.jawhar-secrets` بصلاحية 600.
- PM2 يعمل بالمستخدم `user`: `sudo -u user env PM2_HOME=/home/user/.pm2 pm2 ls`.

التحديث بعد كل `git push` (كـ root):

```bash
export PATH=/opt/node24/bin:$PATH GIT_SSH_COMMAND="ssh -i ~/.ssh/github_key -o IdentitiesOnly=yes"
API=/home/user/web/api-jawhar.souftech.com/public_html
WEB=/home/user/web/jawhar.souftech.com/public_html
for D in $API $WEB; do cd $D && git fetch -q origin && git merge --ff-only origin/main && chown -R user:user $D; done
run() { sudo -u user env HOME=/home/user PATH=$PATH "$@"; }
cd $API && run pnpm install --frozen-lockfile --filter @jawhar/api... && cd apps/api && run pnpm migrate && run pnpm build
run env PM2_HOME=/home/user/.pm2 pm2 restart jawhar-api
cd $WEB && run pnpm install --frozen-lockfile --filter @jawhar/web... && cd apps/web && run pnpm build
run env PM2_HOME=/home/user/.pm2 pm2 restart jawhar-web
```

## الـ API العام

| الطريقة | المسار | الوصف |
|---|---|---|
| GET | `/api/products?locale=ar&depth=1&where[...]` | القطع المنشورة فقط |
| GET | `/api/categories` · `/api/artisans` | الحرف، والحرفيون الموافقون على النشر فقط |
| GET | `/api/wilayas` | الولايات المفعّلة فقط مع أسعار التوصيل |
| GET | `/api/globals/settings` | واتساب، روابط التواصل، حالة استقبال الطلبات |
| POST | `/api/orders/checkout` | إنشاء طلب COD: يعيد حساب الأسعار والمخزون والتوصيل من القاعدة |
| GET | `/api/orders/track/:number?t=TOKEN` | ملخص الطلب دون الهاتف والعنوان |

قراءة الطلبات وتعديلها للمدير فقط. ولا يمكن إنشاء طلب عبر `POST /api/orders` العادي.

## قواعد مطبّقة في الكود

- القطعة الفريدة (stock = 1) تصير «بيعت» تلقائياً عند طلبها، وتعود للبيع إذا أُلغي الطلب أو أُرجع.
- كل طلب جديد حالته «في انتظار الاتصال»، ولا يُرسل قبل التأكيد بالهاتف.
- الأقسام التي لا محتوى حقيقياً لها (الحرفيون، القطع المختارة، التواصل الاجتماعي) تختفي بدل أن تُملأ ببيانات وهمية.
- عبارة «التوصيل إلى N ولاية» تُحسب من الولايات المفعّلة فعلاً.
- الحرفي لا يظهر في الموقع قبل تفعيل خيار «وافق على النشر».
- الصور تُحوَّل إلى WebP بعدة مقاسات، وصورة Open Graph بصيغة JPEG لمعاينات واتساب وفيسبوك.
- الحركة (دخول الواجهة، الظهور عند التمرير، الشريط والرمال المتحركة، بطاقة القطع المتبدلة) معرّفة في `apps/web/src/app/globals.css` تحت `[data-motion]` ويشغّلها `components/Motion.tsx`. لا تعمل لمن فعّل «تقليل الحركة» في جهازه، وإن لم يُحمَّل JavaScript تظهر الصفحة كاملة دون حركة.

## قبل الإطلاق (ما يحتاج ربطاً أو قراراً)

1. **محتوى حقيقي**: صور القطع وأسعارها، وتفعيل الولايات بأسعار شركة التوصيل، ورقم واتساب المتجر في «إعدادات المتجر».
2. **الاستضافة**: Node.js + PostgreSQL لتطبيقي api وweb، مع نسخ احتياطي يومي للقاعدة. ملفات الوسائط محفوظة حالياً على القرص (`apps/api/media`)، والأفضل نقلها إلى تخزين S3/R2 عبر إضافة Payload.
3. **قاعدة البيانات في الإنتاج**: الـ schema يُدفع تلقائياً في التطوير فقط. الإنتاج يعتمد على ملفات `apps/api/src/migrations/`: كل تغيير في الحقول يحتاج `pnpm --filter @jawhar/api migrate:create <اسم>` محلياً، ثم يُرفع مع الكود ويُطبَّق على السيرفر بـ `pnpm migrate`.
4. **الإشعارات**: أضف `TELEGRAM_BOT_TOKEN` و`TELEGRAM_CHAT_ID` ليصل كل طلب جديد إلى الهاتف.
5. **حذف المدير التجريبي** وإنشاء حساب حقيقي بكلمة مرور قوية.
6. **القانون**: قانون 18-05 يشترط السجل التجاري واستضافة داخل الجزائر بنطاق `.com.dz`. البنية قابلة للنقل لأي خادم.
7. **لاحقاً (المرحلة 2)**: السلة، ربط API شركة التوصيل (Yalidine/ZR) في `apps/api`، Meta Pixel + CAPI، تحديث الصفحات فور التعديل (revalidation webhook)، rate limiting عبر Redis إن تعددت النسخ.
