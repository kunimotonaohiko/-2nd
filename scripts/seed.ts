import db from '../lib/db';

interface Sample {
  name: string;
  start_time: string;
  end_time: string | null;
  participants: string;
  purpose: string;
}

const samples: Sample[] = [
  {
    name: '営業戦略 月次定例',
    start_time: '2026-05-12 10:00',
    end_time: '2026-05-12 11:00',
    participants: '田中, 佐藤, 鈴木',
    purpose: '今四半期の営業目標達成に向けた戦略の確認と、地域別の進捗報告を行う。',
  },
  {
    name: '営業部 戦略ミーティング',
    start_time: '2026-05-13 14:00',
    end_time: '2026-05-13 15:00',
    participants: '田中, 山田, 高橋',
    purpose: '営業目標の進捗確認と、次四半期の戦略立案。地域ごとの状況を共有する。',
  },
  {
    name: '医療安全委員会',
    start_time: '2026-05-14 09:00',
    end_time: '2026-05-14 10:30',
    participants: '看護師長, 医師代表, 安全管理者',
    purpose: 'インシデントレポートの集計を共有し、再発防止策を検討する。',
  },
  {
    name: '医療安全 月次レビュー',
    start_time: '2026-05-21 10:00',
    end_time: '2026-05-21 11:00',
    participants: '看護師長, 医療安全管理者',
    purpose: '今月のインシデント件数の集計と、再発防止に向けた取り組みの共有。',
  },
  {
    name: '感染対策ミーティング',
    start_time: '2026-05-15 13:00',
    end_time: '2026-05-15 14:00',
    participants: '感染対策チーム',
    purpose: '院内感染の発生状況の把握と、対策の見直し。',
  },
  {
    name: '採用面接フィードバック会',
    start_time: '2026-05-16 16:00',
    end_time: '2026-05-16 17:00',
    participants: '人事部 全員',
    purpose: '今月の採用面接を振り返り、評価基準のすり合わせを行う。',
  },
  {
    name: 'IT部門ロードマップ会議',
    start_time: '2026-05-17 15:00',
    end_time: '2026-05-17 16:00',
    participants: '情報システム部 全員',
    purpose: '次年度のシステム刷新計画と予算配分の議論。',
  },
  {
    name: '広報企画ブレスト',
    start_time: '2026-05-18 14:00',
    end_time: '2026-05-18 15:30',
    participants: '広報担当, デザイナー',
    purpose: '次回広報誌の特集テーマと SNS 発信スケジュールの検討。',
  },
];

const insert = db.prepare(`
  INSERT INTO meetings (name, start_time, end_time, participants, purpose, created_by, updated_by)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const seedUser = 'seed@example.com';
const insertMany = db.transaction(() => {
  for (const m of samples) {
    insert.run(m.name, m.start_time, m.end_time, m.participants, m.purpose, seedUser, seedUser);
  }
});
insertMany();

console.log(`${samples.length} 件のサンプル会議を投入しました。`);
console.log('「営業戦略 月次定例」と「営業部 戦略ミーティング」、');
console.log('「医療安全委員会」と「医療安全 月次レビュー」が類似会議として提案されるはずです。');
