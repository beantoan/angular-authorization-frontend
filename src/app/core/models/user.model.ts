import {Role} from './role.model';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  status: string;
  status_name: string;
  last_sign_in_at: string;
  role: Role;
}
