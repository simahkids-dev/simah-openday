/**
 * سمة للأطفال — تسجيل ورش اليوم المفتوح
 * يُلصق في Google Apps Script مربوط بـ Google Sheet (Extensions ▸ Apps Script)
 */
const CFG = {
  SHEET_ID: '1vEIt9JFQKnUz0oTUurrS2V_M5RtX2h5V4-eztqa1AK4',
  SHEET: 'التسجيلات',
  FOLDER_NAME: 'إيصالات اليوم المفتوح',
  CAP_PIZZA: 15,
  CAP_HOT: 10,
  ALERT_EMAIL: 'simakids@qafelah.org.sa',   // بريد يصله تنبيه تجاوز العدد
  HOLD_MINUTES: 60
};
const HEAD = ['التاريخ', 'الرقم المرجعي', 'الحالة', 'اسم الطفل', 'العمر', 'الجنس', 'البيتزا', 'الهوت شوكلت',
  'ولي الأمر', 'الجوال', 'جوال آخر', 'الحساسية', 'موافقة التصوير', 'مصدر المعرفة', 'كود الخصم', 'إجمالي الطلب', 'رابط الإيصال'];

function sheet_() {
  const ss = SpreadsheetApp.openById(CFG.SHEET_ID);
  let sh = ss.getSheetByName(CFG.SHEET);
  if (!sh) {
    sh = ss.insertSheet(CFG.SHEET);
    sh.appendRow(HEAD); sh.setFrozenRows(1); sh.setRightToLeft(true);
    sh.getRange(1, 1, 1, HEAD.length).setFontWeight('bold').setBackground('#A8B187').setFontColor('#ffffff');
  }
  return sh;
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function doGet() { return out_({ ok: true, msg: 'Simah open day endpoint' }); }

function doPost(e) {
  let lock = null;
  try {
    const p = JSON.parse(e.postData.contents);
    if (p.action === 'ping') return out_({ ok: true });
    if (p.action === 'receipt') return out_(receipt_(p));   // بدون قفل: أسرع
    if (p.action === 'register') { lock = LockService.getScriptLock(); lock.waitLock(20000); return out_(register_(p)); }
    return out_({ ok: false, error: 'unknown action' });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally { if (lock) lock.releaseLock(); }
}

function folder_() {
  const props = PropertiesService.getScriptProperties(), id = props.getProperty('folderId');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  const it = DriveApp.getFoldersByName(CFG.FOLDER_NAME);
  const f = it.hasNext() ? it.next() : DriveApp.createFolder(CFG.FOLDER_NAME);
  props.setProperty('folderId', f.getId()); return f;
}

function register_(p) {
  const sh = sheet_();
  expire_(sh);
  const ref = 'SM-' + Utilities.formatDate(new Date(), 'Asia/Riyadh', 'ddHHmm') + '-' + Math.floor(100 + Math.random() * 900);
  const now = new Date();
  (p.kids || []).forEach(k => {
    sh.appendRow([now, ref, 'بانتظار التحويل', k.name, k.age, k.sex, k.pizza ? '✓' : '', k.hot ? '✓' : '',
      p.parent, "'" + p.phone1, p.phone2 ? "'" + p.phone2 : '', p.allergy, p.photo, p.source, p.code, p.total, '']);
  });
  checkCapacity_(sh);
  return { ok: true, ref: ref };
}

function receipt_(p) {
  const sh = sheet_();
  const blob = Utilities.newBlob(Utilities.base64Decode(p.file.data), p.file.type, p.ref + ' - ' + p.file.name);
  const url = folder_().createFile(blob).getUrl();
  sh.getRange('B:B').createTextFinder(p.ref).matchEntireCell(true).findAll().forEach(c => {
    sh.getRange(c.getRow(), 3).setValue('إيصال مرفوع'); sh.getRange(c.getRow(), 17).setValue(url);
  });
  return { ok: true };
}

// الطلبات التي مر عليها أكثر من ساعة بلا إيصال تُعلَّم «انتهى الحجز» (تبقى بياناتها للتواصل)
function expire_(sh) {
  const v = sh.getDataRange().getValues(), lim = Date.now() - CFG.HOLD_MINUTES * 60000;
  for (let r = 1; r < v.length; r++) {
    if (v[r][2] === 'بانتظار التحويل' && new Date(v[r][0]).getTime() < lim) sh.getRange(r + 1, 3).setValue('انتهى الحجز');
  }
}

// لا نقفل التسجيل؛ نرسل تنبيهاً عند تجاوز العدد
function checkCapacity_(sh) {
  const v = sh.getDataRange().getValues(); let pz = 0, ht = 0;
  for (let r = 1; r < v.length; r++) {
    if (v[r][2] === 'انتهى الحجز' || v[r][2] === 'ملغى') continue;
    if (v[r][6]) pz++; if (v[r][7]) ht++;
  }
  const props = PropertiesService.getScriptProperties(), msgs = [];
  if (pz > CFG.CAP_PIZZA) msgs.push('ورشة البيتزا: ' + pz + ' من ' + CFG.CAP_PIZZA);
  if (ht > CFG.CAP_HOT) msgs.push('ورشة الهوت شوكلت: ' + ht + ' من ' + CFG.CAP_HOT);
  if (msgs.length && CFG.ALERT_EMAIL.indexOf('@') > 0) {
    MailApp.sendEmail(CFG.ALERT_EMAIL, 'تنبيه سمة: تجاوز عدد التسجيل', 'تجاوز العدد المحدد:\n' + msgs.join('\n') + '\n\nراجعي الشيت: ' + SpreadsheetApp.openById(CFG.SHEET_ID).getUrl());
  }
  props.setProperty('counts', JSON.stringify({ pz: pz, ht: ht }));
}
