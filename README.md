# 会議管理アプリ

社内の会議を一覧表示・検索・登録できる Web アプリです。Google Workspace アカウント (`@kenkohkai.jp` / `@kunimoto-hp.com`) でログインしたユーザーが、会議の名称・日時・参加者・目的を自由に登録・更新できます。趣旨が似ている会議があれば、入力中に「一緒に開催できないか」というかたちで自動的に提案します。

## 主な機能

- Google ログイン (`@kenkohkai.jp` または `@kunimoto-hp.com` のみ許可)
- 会議の登録・編集・削除 (ログインユーザーなら誰でも可)
- 会議名・参加者・目的によるフリーワード検索
- 入力中の「目的」と既存の会議を比較して、類似度の高いものを自動で提案

## 技術スタック

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- NextAuth.js (Google プロバイダー)
- SQLite (better-sqlite3) によるローカル DB

## セットアップ手順

### 1. リポジトリを取得して依存パッケージをインストール

```bash
npm install
```

### 2. Google OAuth クライアントを作成

1. [Google Cloud Console](https://console.cloud.google.com/) で新しいプロジェクトを作成 (もしくは既存のものを利用)
2. 「APIs & Services」→「OAuth consent screen」で内部用アプリとして設定
3. 「APIs & Services」→「Credentials」で **OAuth 2.0 Client ID** (Web application) を作成
   - **Authorized redirect URIs** に以下を登録
     - `http://localhost:3000/api/auth/callback/google` (ローカル開発用)
     - `https://<本番ドメイン>/api/auth/callback/google` (本番用)
4. 発行された Client ID / Client Secret を控える

### 3. 環境変数を設定

`.env.example` をコピーして `.env.local` を作成し、値を埋めます。

```bash
cp .env.example .env.local
```

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...   # openssl rand -base64 32 で生成
NEXTAUTH_URL=http://localhost:3000
```

### 4. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開くと、ログイン画面に遷移します。許可ドメインの Google アカウントでログインしてください。

### 5. 本番ビルド

```bash
npm run build
npm start
```

## データの保管場所

SQLite のデータベースファイルは `data/meetings.db` に保存されます。バックアップする場合はこのファイルをコピーしてください。`data/` 以下は `.gitignore` 済みです。

## 類似会議の判定について

「目的」テキストを文字 2-gram と単語に分解し、Jaccard 係数 (集合の重なり具合を 0〜1 で表す指標) で類似度を計算しています。閾値 (デフォルト 0.2) を超えた会議を最大 5 件まで提案します。日本語向けの形態素解析は使っていないため厳密ではありませんが、似た趣旨の会議を見落とさないための「気づきのきっかけ」として機能します。

しきい値や上限件数は `lib/similarity.ts` の `findSimilar()` で調整できます。

## 許可ドメインを変更したい場合

`lib/auth.ts` の `ALLOWED_DOMAINS` を編集してください。
