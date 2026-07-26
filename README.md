# animals ジェネレータ — 最新一式

前回 zip を同期して以降の、animals 生成に関わる全ファイル。
Body Flow は不採用のため含まない（管状構造へ収束するため破棄済み）。

## 中身

### 描画エンジン（変更しない）
- `generator/organic/iso.ts` — アイソメ描画エンジン。輪郭線（濃いグレー #454545、全エッジ、
  途切れなし、太さ一定）をオプションで出力。`renderForm(form, { outline: true })` で有効。
- `generator/organic/palette.ts` — 12配色 + PALE + 構造確認用の grey。
- `generator/organic/types.ts` — Form / Node / Link / Slab の型。
- `generator/organic/grow.ts` — chain / ring / branch などの基本ヘルパー。
- `generator/organic/forms/` — 承認済み固定6形。
- `generator/organic/random/` — 21原型（有機9/中間6/人工6）とバッチ選定ロジック。

### 構造カテゴリと部材語彙（維持）
- `generator/varied/parts.ts` — 部材語彙。湾曲板・厚い輪・半環・くさび・折れ梁・扁平楕円体・
  段差板・短い筒・中空箱・二股材など。既存レンダラを変えず、節+管とスラブの合成で表現。
- `generator/varied/categories.ts` — A群12カテゴリ（単一塊/片持ち/吊り/入れ子/貫通/相互支持/
  大空洞/離散/平面と立体/大小比/低広/高縦）。
- `generator/varied/categories-b.ts` — B群12カテゴリ（ねじれ環/二重片持ち/横断空洞/多点支持/
  板と中空/折り返し/三者関係/単純外形+複雑内部/上部展開/中央持上げ/一点噛合/流れ再接続）。
- `generator/varied/categories-c.ts` — C群12カテゴリ（最新。接続密度と最大部材比の規則を
  構造から満たすよう設計）。
- `generator/varied/EVOLUTION.md` — 弱い構造（塊+添え物）の診断と、接続密度 ≥0.6 /
  最大部材比 ≤0.5 の規則の記録。

### スクリプト
- `generator/scripts/build-varied.ts` — A群を生成。`--grey` で構造確認、`--outline` で輪郭線。
- `generator/scripts/build-varied-b.ts` — B群を生成（輪郭線つき）。
- `generator/scripts/build-varied-c.ts` — C群を生成（輪郭線つき）。
- `generator/scripts/build-organic.ts` — 21原型のランダムバッチ（`--seed X --count N`、最大10）。
- `generator/scripts/validate-generator.ts` — 検証。
- `generator/scripts/cli.ts` — 引数パーサ。

## 使い方

```bash
# C群（最新の構造規則）を輪郭線つきで生成
npx tsx generator/scripts/build-varied-c.ts <好きなseed>

# A群を、まずグレーで構造確認 → その後カラー+輪郭線
npx tsx generator/scripts/build-varied.ts <seed> --grey
npx tsx generator/scripts/build-varied.ts <seed> --outline

# 21原型のランダム10体
npx tsx generator/scripts/build-organic.ts -- --seed <seed> --count 10
```

出力は `generated/` 以下に SVG で書かれる（PNG化は cairosvg 等で別途）。

## 維持している合意事項
- 描画仕様（アイソメ/白背景/フラット/現行パレット/輪郭線/薄い影/顔なし/2〜3色）は固定。
- 接続密度 ≥0.6、最大部材比 ≤0.5。
- 部材は近接でなく実接続で繋ぐ。塊+添え物、外形と内部が無関係、意味なく散る小部材は作らない。
- Body Flow指標は不採用。
- 最終選別（採否・美的判断）は人間が目視で行う。数値だけで「成立」としない。
