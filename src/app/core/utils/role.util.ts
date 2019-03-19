import {Role} from '../models/role.model';
import {NavItem} from '../models/nav-item.model';

export class RoleUtil {

  constructor() {
  }

  static hasPermission(role: Role, permission: { section, rule }): boolean {
    if (!role) {
      return false;
    }

    if (role.is_admin) {
      return true;
    }

    if (role.the_roles) {
      for (const theRole of role.the_roles) {
        if (theRole.enabled &&
          theRole.section === permission.section &&
          theRole.rule === permission.rule) {

          return true;
        }
      }
    }

    return false;
  }

  static getNavItemsByRole(role: Role, items: NavItem[]): NavItem[] {
    if (!role) {
      return [];
    }

    if (role.is_admin) {
      return items;
    }

    const allowedItems: NavItem[] = [];

    for (const item of items) {
      if (item.children && item.children.length > 0) {
        item.children = this.getNavItemsByRole(role, item.children);

        if (item.children.length > 0) {
          allowedItems.push(item);
        }
      } else {
        const param = {section: item.section, rule: item.rule};

        if (RoleUtil.hasPermission(role, param)) {
          allowedItems.push(item);
        }
      }
    }

    return allowedItems;
  }
}
