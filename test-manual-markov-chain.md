# テスト手順書のマルコフ連鎖図示

於 http://regional.rubykaigi.org/tochigi07/

---

## 自己紹介

- 中島 滋 a.k.a. ledsun
- 受託開発でWebアプリケーションを開発
- アジャイルとJavaScriptとC#
- 忍者式テスト
- 咳マニア

---

## バグをマルコフ連鎖で自動生成

- 咳マニアは真似をする
- テスト手順と誤解
- そこにテスト手順書があった
https://github.com/lodqa/grapheditor/wiki/User-Acceptance-Test

---

## マルコ連鎖の作り方

- https://github.com/substack/node-markov を改造
- kuromoji.js で形態素解析
- 文節チャンキング
  - 1 個以上の自立語および0 個以上の付属語の系列
  - 日本語はn-gramじゃ（文字でも単語でも）ダメだった

---

## 自動生成してみる

DEMO
意味はないです

---

## 図示

- http://getspringy.com/ を使う
- 力学モデル (グラフ描画アルゴリズム)
- ソーシャルネットのグラフ化でよく使うやつ
- マルコフ連鎖には向かない？

---

## 見る

DEMO

---

## 課題

- 辞書
  - D&D がDと&とDに
  - kuromoji.jsは外部辞書を使えない、メンテもされていない
  - 最初からMeCabを使えばよかった
- 自動生成の精度が上っても、日本語らしさが上がるだけ
  - テストの役には立たない
- 力学モデルなのに重みを使っていない
