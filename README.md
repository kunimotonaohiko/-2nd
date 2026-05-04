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

---

## ローカルでの動作確認

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. Google OAuth クライアントの作成

1. [Google Cloud Console](https://console.cloud.google.com/) にログインしてプロジェクトを作成
2. 「APIs & Services」→「OAuth consent screen」で **Internal**(社内のみ)として設定
3. 「Credentials」→「Create Credentials」→「OAuth client ID」→「Web application」
   - **Authorized redirect URIs** に以下を登録
     - `http://localhost:3000/api/auth/callback/google`(動作確認用)
     - `https://<本番ドメイン>/api/auth/callback/google`(本番用)
4. 発行された Client ID / Client Secret を控える

### 3. 環境変数の設定

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

### 4. サンプルデータの投入(任意・初回のみ推奨)

類似会議の提案機能を確認するため、サンプルの会議を 8 件投入できます。

```bash
npm run seed         # サンプルデータを投入
npm run seed:clear   # 全会議データを削除(やり直したい時)
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開くと、ログイン画面に遷移します。許可ドメインの Google アカウントでログインしてください。

---

## 本番環境へのデプロイ(さくらのVPS + Docker)

200 名規模での利用を想定し、**さくらのVPS 2GB プラン (1,738円/月)** を推奨します。

### なぜさくらのVPSか

- 日本語サポートあり、サーバーは石狩・東京・大阪のいずれかに設置可能(医療情報を扱う場合の物理所在地の説明がしやすい)
- 月額固定でコストが読める(従量課金のクラウドより予算化しやすい)
- 200名規模・SQLite 利用なら 2GB メモリで十分

### 手順 1. さくらのVPS の契約

1. https://vps.sakura.ad.jp/ にアクセス
2. 「2GB プラン」を選択(石狩リージョン推奨)
3. OS は **Ubuntu 22.04 LTS** を選択
4. 契約後、IP アドレスとログイン情報をメモ

### 手順 2. ドメインの準備

OAuth ログインには HTTPS とドメインが必要です。社内で利用しているドメインのサブドメインを 1 つ用意してください。

例: `meetings.kunimoto-hp.com` を VPS の IP アドレスに向ける A レコードを追加。

### 手順 3. サーバー初期設定

SSH でサーバーにログインし、Docker をインストールします。

```bash
# SSH ログイン
ssh root@<VPSのIPアドレス>

# Docker 公式インストールスクリプト
curl -fsSL https://get.docker.com | sh

# 動作確認
docker --version
docker compose version
```

### 手順 4. アプリの配置

```bash
# 作業ディレクトリを作成
mkdir -p /opt/meetings && cd /opt/meetings

# リポジトリを clone
git clone https://github.com/kunimotonaohiko/-2nd.git .
git checkout claude/meeting-management-app-NYA27

# 環境変数ファイルを作成
cat > .env.local <<EOF
GOOGLE_CLIENT_ID=<Google Cloud Console で取得した値>
GOOGLE_CLIENT_SECRET=<同上>
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://meetings.kunimoto-hp.com
EOF

# ドメイン名を Caddy 用にも設定
echo "DOMAIN=meetings.kunimoto-hp.com" > .env
```

### 手順 5. Google OAuth に本番リダイレクト URI を追加

Google Cloud Console の OAuth クライアント設定で、Authorized redirect URIs に以下を追加:

```
https://meetings.kunimoto-hp.com/api/auth/callback/google
```

### 手順 6. 起動

```bash
# 本番用 (HTTPS 付き) で起動
docker compose -f docker-compose.prod.yml up -d --build

# 起動状況を確認
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f app
```

`https://meetings.kunimoto-hp.com` にアクセスし、ログイン画面が表示されれば成功です。Caddy が自動的に Let's Encrypt の証明書を取得し、HTTPS が有効になります(初回数十秒かかります)。

### バックアップ

会議データは Docker の名前付きボリューム `meetings_data` に保存されています。バックアップは以下のコマンドで取得できます。

```bash
# バックアップを取得
docker run --rm \
  -v meetings_meetings_data:/data \
  -v $(pwd):/backup \
  busybox tar czf /backup/meetings-backup-$(date +%Y%m%d).tar.gz -C /data .

# 復元する場合
docker run --rm \
  -v meetings_meetings_data:/data \
  -v $(pwd):/backup \
  busybox tar xzf /backup/meetings-backup-YYYYMMDD.tar.gz -C /data
```

cron で定期バックアップを設定することを推奨します。

### アップデート

```bash
cd /opt/meetings
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

---

## データの保管場所

- ローカル開発: `data/meetings.db`(プロジェクトルート、`.gitignore` 済み)
- 本番(Docker): 名前付きボリューム `meetings_data`(コンテナ内では `/app/data`)

## 類似会議の判定について

「目的」テキストを文字 2-gram と単語に分解し、Jaccard 係数 (集合の重なり具合を 0〜1 で表す指標) で類似度を計算しています。閾値 (デフォルト 0.2) を超えた会議を最大 5 件まで提案します。日本語向けの形態素解析は使っていないため厳密ではありませんが、似た趣旨の会議を見落とさないための「気づきのきっかけ」として機能します。

しきい値や上限件数は `lib/similarity.ts` の `findSimilar()` で調整できます。

## 許可ドメインを変更したい場合

`lib/auth.ts` の `ALLOWED_DOMAINS` を編集してください。
