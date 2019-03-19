import {Section} from './section.model';
import {TheRole} from './the-role.model';

export interface Role {
  id: number;
  name: string;
  title: string;
  description: string;
  the_role: string;
  is_admin: boolean;
  sections: Section[];
  section_ids: number[];
  the_roles: TheRole[];
}
