import {Component, NgModule, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CoreModule} from '../core/core.module';
import {
  MatButtonModule,
  MatChipsModule,
  MatDialog,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatPaginator,
  MatPaginatorModule,
  MatProgressBarModule,
  MatSnackBar,
  MatSnackBarModule,
  MatTableModule
} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import {AppEventEmitter} from '../core/services/app-event-emitter.service';
import {merge} from 'rxjs';
import {finalize} from 'rxjs/operators';
import {RoleService} from '../core/services/role.service';
import {Role} from '../core/models/role.model';
import {RoleDialogComponent, RoleDialogModule} from '../role-dialog/role-dialog.component';
import {MessageComponent} from '../message/message.component';
import {MessageUtil} from '../core/utils/message.util';
import {PageHeaderModule} from '../page-header/page-header.component';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})
export class RoleComponent implements OnInit, OnDestroy {

  rolesDataSource: Role[] = [];
  rolesTotalElements = 0;

  rolesPageSize = 30;

  tableColumns = ['name', 'title', 'sections', 'actions'];

  @ViewChild('rolesPaginator') rolesPaginator: MatPaginator;

  constructor(
    private appEventEmitter: AppEventEmitter,
    private createRoleDialog: MatDialog,
    private roleService: RoleService,
    private snackBar: MatSnackBar,
  ) {
  }

  ngOnInit() {
    this.loadRoles(1);

    this.subscribeEvents();
  }

  ngOnDestroy() {
    this.unsubscribeEvents();
  }

  private unsubscribeEvents() {
    this.rolesPaginator.page.unsubscribe();
  }

  private subscribeEvents() {
    this.rolesPaginator.page.subscribe(event => {
      this.loadRoles(this.rolesPaginator.pageIndex + 1);
    });

    merge(
      this.appEventEmitter.onRoleSaved
    ).subscribe(data => {
      if (data) {
        this.loadRoles(1);
      }
    });
  }

  private loadRoles(page: number) {
    this.appEventEmitter.loadingState.next(true);

    this.roleService.index(page, this.rolesPageSize)
      .pipe(
        finalize(() => {
          this.appEventEmitter.loadingState.next(false);
        })
      ).subscribe(
      data => {
        this.rolesDataSource = data.entries;
        this.rolesTotalElements = data.total_elements;
      },
      res => {
        this.rolesDataSource = [];
        this.rolesTotalElements = 0;

        const msg = MessageUtil.getErrorMessage(res, 'role.load_list_failed');

        this.snackBar.openFromComponent(MessageComponent, {
          duration: 5000,
          data: {type: MessageComponent.TYPE_ERROR, content: msg}
        });
      });
  }

  private showRoleDialog(role: Role | {} = null) {
    this.createRoleDialog.open(RoleDialogComponent, {
      width: '800px',
      autoFocus: true,
      data: role
    });
  }

  onAddRoleClicked() {
    this.showRoleDialog();
  }

  onEditRoleClicked(role: Role) {
    this.showRoleDialog(role);
  }

  onDeleteRoleClicked(role: Role) {

  }
}

@NgModule({
  imports: [
    CoreModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatTableModule,
    MatChipsModule,
    FlexLayoutModule,
    RoleDialogModule,
    PageHeaderModule
  ],
  exports: [RoleComponent],
  declarations: [RoleComponent],
})
export class RoleModule {
}
