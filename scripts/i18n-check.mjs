// 画面の英語（<T>…</T>、<T s="…" />、t("…")、tx("…")）を集めて、
// 言語ごとの訳文ファイル（lib/i18n/<言語>.ts）に抜けや余りがないかを確かめる。
//
//   node scripts/i18n-check.mjs          … 抜けと余りを表示（抜けがあれば終了コード 1）
//   node scripts/i18n-check.mjs --keys   … 集めた英語を1行ずつ表示

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const LANGS = ["vi", "ne", "my", "si", "ta", "sw", "uz"]

const normalize = (s) => s.replace(/\s+/g, " ").trim()
const decode = (s) =>
  s.replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(p, out)
    else if (/\.(tsx?|mts)$/.test(entry.name) && !p.includes(`${path.sep}i18n${path.sep}`)) out.push(p)
  }
  return out
}

const keys = new Map() // key -> 最初に見つかった場所
const problems = []

function add(key, file, node, sf) {
  key = normalize(key)
  if (!key) return
  if (!keys.has(key)) {
    const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf))
    keys.set(key, `${path.relative(root, file)}:${line + 1}`)
  }
}

for (const file of ["app", "components", "lib"].flatMap((d) => walk(path.join(root, d)))) {
  const text = fs.readFileSync(file, "utf8")
  if (!/\bT\b|\btx?\(/.test(text)) continue
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const visit = (node) => {
    if (ts.isJsxElement(node) && node.openingElement.tagName.getText(sf) === "T") {
      const parts = []
      const kids = node.children.filter((c) => !(ts.isJsxText(c) && !c.text.trim()))
      // <T>{skill.en}</T> のように、データ（tx で目印を付けたもの）をそのまま渡すのはよい
      if (kids.length === 1 && ts.isJsxExpression(kids[0]) && kids[0].expression && !ts.isStringLiteralLike(kids[0].expression)) return ts.forEachChild(node, visit)
      for (const child of node.children) {
        if (ts.isJsxText(child)) parts.push(decode(child.text))
        else if (ts.isJsxExpression(child) && child.expression && ts.isStringLiteralLike(child.expression)) parts.push(child.expression.text)
        else problems.push(`${path.relative(root, file)}:${sf.getLineAndCharacterOfPosition(child.getStart(sf)).line + 1} <T> の中に文字以外があります（s と v を使う）`)
      }
      add(parts.join(""), file, node, sf)
    }
    if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(sf) === "T") {
      const attr = node.attributes.properties.find((p) => ts.isJsxAttribute(p) && p.name.getText(sf) === "s")
      const init = attr?.initializer
      if (init && ts.isStringLiteral(init)) add(init.text, file, node, sf)
      else if (init && ts.isJsxExpression(init) && init.expression && ts.isStringLiteralLike(init.expression)) add(init.expression.text, file, node, sf)
      else problems.push(`${path.relative(root, file)}:${sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1} <T s=…> が文字列ではありません`)
    }
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && ["t", "tx"].includes(node.expression.text)) {
      const arg = node.arguments[0]
      if (arg && ts.isStringLiteralLike(arg)) add(arg.text, file, node, sf)
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
}

if (process.argv.includes("--keys")) {
  for (const k of keys.keys()) console.log(k)
  process.exit(0)
}

let missingTotal = 0
for (const lang of LANGS) {
  const src = fs.readFileSync(path.join(root, "lib/i18n", `${lang}.ts`), "utf8")
  // 訳文ファイルは「"英語": "訳",」の形で1行に1つ
  const dict = new Map()
  for (const m of src.matchAll(/^\s*("(?:[^"\\]|\\.)*")\s*:\s*("(?:[^"\\]|\\.)*"),?\s*$/gm)) dict.set(JSON.parse(m[1]), JSON.parse(m[2]))
  const missing = [...keys.keys()].filter((k) => !dict.has(k))
  const unused = [...dict.keys()].filter((k) => !keys.has(k))
  const badVars = [...keys.keys()].filter((k) => dict.has(k)).filter((k) => {
    const want = (k.match(/\{\w+\}/g) ?? []).sort().join()
    const got = (dict.get(k).match(/\{\w+\}/g) ?? []).sort().join()
    return want !== got
  })
  missingTotal += missing.length + badVars.length
  console.log(`${lang}: ${dict.size - unused.length}/${keys.size}` + (missing.length ? `  抜け ${missing.length}` : "") + (unused.length ? `  使っていない ${unused.length}` : "") + (badVars.length ? `  {…}が合わない ${badVars.length}` : ""))
  for (const k of missing.slice(0, 5)) console.log(`    抜け: ${JSON.stringify(k)}  (${keys.get(k)})`)
  for (const k of badVars) console.log(`    {…}が合わない: ${JSON.stringify(k)}`)
  if (process.argv.includes("--verbose")) for (const k of unused) console.log(`    使っていない: ${JSON.stringify(k)}`)
}
for (const p of problems) console.log(`注意: ${p}`)
console.log(`英語 ${keys.size} 件`)
process.exit(missingTotal || problems.length ? 1 : 0)
