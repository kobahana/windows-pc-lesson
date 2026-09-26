// データの中の英語に付ける目印（中身はそのまま返す）。表示するときに useT() の t() に通す。
// scripts/i18n-check.mjs が tx("…") を拾って、訳の抜けを確かめる
export const tx = (en: string) => en
