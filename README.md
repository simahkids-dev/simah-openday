# رابط تسجيل ورش اليوم المفتوح — سمة للأطفال

## الملفات
- `index.html` — صفحة التسجيل (كل الإعدادات في أعلاها داخل `CONFIG`).
- `assets/` — الخطوط والشعار.
- `apps-script/Code.gs` — الكود الذي يحفظ في Google Sheet والإيصالات في Drive.

## ١) ربط Google Sheet (مرة واحدة)
1. أنشئي Google Sheet جديداً باسم «تسجيل اليوم المفتوح».
2. Extensions ▸ Apps Script، احذفي المحتوى والصقي `Code.gs`.
3. في أعلى الكود: ضعي بريد الفريق في `ALERT_EMAIL` (يصلكم تنبيه إذا تجاوز العدد ١٥ للبيتزا أو ١٠ للهوت شوكلت).
4. Deploy ▸ New deployment ▸ Web app:
   - Execute as: **Me**
   - Who has access: **Anyone**
5. انسخي رابط Web app وضعيه في `index.html` داخل `SCRIPT_URL`.

> عند تعديل الكود لاحقاً: Deploy ▸ **Manage deployments** ▸ ✏️ ▸ Version: New version. **لا تسوي New deployment** حتى لا يتغير الرابط.

## ٢) النشر على GitHub Pages (رابط ثابت للباركود)
1. ارفعي محتوى المجلد إلى مستودع (مثلاً `simah-openday`).
2. Settings ▸ Pages ▸ Branch: `main` / root.
3. الرابط يصير: `https://<الحساب>.github.io/simah-openday/` — هذا الذي يتحول لباركود.
4. أي تعديل لاحق على `index.html` (مثل بيانات البنك) لا يغيّر الرابط.

## ٣) قبل الطباعة
- عبّي `BANK_NAME` و`ACCOUNT_NAME` و`IBAN` في `index.html`.
- جرّبي تسجيلاً كاملاً من الجوال وتأكدي أنه ظهر في الشيت والإيصال في Drive.

## الحالات في الشيت
بانتظار التحويل ← إيصال مرفوع ← (يغيّرها الفريق يدوياً إلى) مؤكَّد · وبعد ساعة بلا إيصال: انتهى الحجز.
