export interface Section {
  id: number;
  action_key: string;
  name: string;
  desc: string;
  depth: number;
  children_count: number;
  is_display: number;
  created_at: Date;
  title_with_parent: string;
  parent_id: number;
  parent: Section;
  children: Section[];
  child_section_ids: number[];
}
