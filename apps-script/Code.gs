/**
 * 会議管理シート用 Apps Script
 *
 * 機能:
 *   1. 「会議名」または「目的」の編集を検知し、類似する既存会議を自動でピックアップして
 *      F 列「類似会議」に書き込む
 *   2. メニュー「会議管理」→「類似会議を全行で再計算」で全行を一括再計算
 *
 * シート構成 (1 行目はヘッダー):
 *   A: 会議名 / B: 開始日時 / C: 終了日時 / D: 参加者 / E: 目的 / F: 類似会議 (自動)
 */

const SHEET_NAME = '会議一覧';
const COL = {
  NAME: 1,
  START: 2,
  END: 3,
  PARTICIPANTS: 4,
  PURPOSE: 5,
  SIMILAR: 6,
};

// 類似度の閾値 (0〜1)。下げるほど多くの会議が「類似」と判定される
const SIMILARITY_THRESHOLD = 0.2;
// 表示する類似会議の最大件数
const TOP_N = 3;

/**
 * セルが編集されたら自動的に類似会議を再計算する (シンプルトリガー)
 */
function onEdit(e) {
  const sheet = e.range.getSheet();
  if (sheet.getName() !== SHEET_NAME) return;

  const row = e.range.getRow();
  if (row < 2) return; // ヘッダー行はスキップ

  const col = e.range.getColumn();
  // 会議名 or 目的が変わったときだけ再計算
  if (col !== COL.NAME && col !== COL.PURPOSE) return;

  updateSimilarMeetings(sheet, row);
}

/**
 * 指定した行の類似会議を計算して F 列に書き込む
 */
function updateSimilarMeetings(sheet, targetRow) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const data = sheet.getRange(2, 1, lastRow - 1, COL.SIMILAR).getValues();
  const targetIdx = targetRow - 2;
  if (targetIdx < 0 || targetIdx >= data.length) return;

  const target = data[targetIdx];
  const targetName = String(target[COL.NAME - 1] || '');
  const targetPurpose = String(target[COL.PURPOSE - 1] || '');
  const targetText = `${targetName} ${targetPurpose}`.trim();

  if (!targetText) {
    sheet.getRange(targetRow, COL.SIMILAR).setValue('');
    return;
  }

  const candidates = [];
  for (let i = 0; i < data.length; i++) {
    if (i === targetIdx) continue;
    const name = String(data[i][COL.NAME - 1] || '');
    const purpose = String(data[i][COL.PURPOSE - 1] || '');
    const otherText = `${name} ${purpose}`.trim();
    if (!otherText) continue;
    const score = similarity(targetText, otherText);
    if (score >= SIMILARITY_THRESHOLD) {
      candidates.push({ name, score });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  const top = candidates.slice(0, TOP_N);

  if (top.length === 0) {
    sheet.getRange(targetRow, COL.SIMILAR).setValue('');
    return;
  }

  const text = top
    .map((c) => `${c.name} (${Math.round(c.score * 100)}%)`)
    .join(' / ');
  sheet.getRange(targetRow, COL.SIMILAR).setValue(`一緒に開催を検討: ${text}`);
}

/**
 * メニューから呼び出す: 全行で類似会議を再計算
 */
function recalculateAll() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    SpreadsheetApp.getUi().alert(`「${SHEET_NAME}」シートが見つかりません。`);
    return;
  }
  const lastRow = sheet.getLastRow();
  for (let row = 2; row <= lastRow; row++) {
    updateSimilarMeetings(sheet, row);
  }
  SpreadsheetApp.getUi().alert('類似会議の再計算が完了しました。');
}

/**
 * シートを開いたときにカスタムメニューを追加
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('会議管理')
    .addItem('類似会議を全行で再計算', 'recalculateAll')
    .addToUi();
}

// ===== 類似度計算ロジック =====

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[\s　]+/g, ' ')
    .replace(/[、。,.!?！？「」『』（）()\[\]【】・:：;；]/g, ' ')
    .trim();
}

function bigrams(text) {
  const t = normalize(text).replace(/\s+/g, '');
  const grams = new Set();
  for (let i = 0; i < t.length - 1; i++) {
    grams.add(t.slice(i, i + 2));
  }
  return grams;
}

function tokens(text) {
  const result = new Set();
  normalize(text).split(/\s+/).forEach((t) => {
    if (t.length > 1) result.add(t);
  });
  return result;
}

function jaccard(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function similarity(a, b) {
  const bigramScore = jaccard(bigrams(a), bigrams(b));
  const tokenScore = jaccard(tokens(a), tokens(b));
  return bigramScore * 0.7 + tokenScore * 0.3;
}
