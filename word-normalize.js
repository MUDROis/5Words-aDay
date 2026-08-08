'use strict';
/* Чистая функция нормализации ответа диктанта (браузер + Node-тесты).
   Апострофы убираются, чтобы «don't» и «dont» считались одинаковыми.
   Дефисы и остальные буквы/цифры сохраняются. */

function normalizeWord(s) {
  return String(s == null ? '' : s)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { normalizeWord };
}
