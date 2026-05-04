export interface Meeting {
  id: number;
  name: string;
  start_time: string;
  end_time: string | null;
  participants: string;
  purpose: string;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}
