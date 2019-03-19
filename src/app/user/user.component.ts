import {Component, NgModule, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CoreModule} from '../core/core.module';
import {
  MatButtonModule,
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
import {UserService} from '../core/services/user.service';
import {User} from '../core/models/user.model';
import {UserDialogComponent, UserDialogModule} from '../user-dialog/user-dialog.component';
import {MessageComponent} from '../message/message.component';
import {MessageUtil} from '../core/utils/message.util';
import {PageHeaderModule} from '../page-header/page-header.component';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, OnDestroy {

  usersDataSource: User[] = [];
  usersTotalElements = 0;

  usersPageSize = 30;

  tableColumns = ['name', 'email', 'role', 'status', 'last_sign_in_at', 'actions'];

  @ViewChild('usersPaginator') usersPaginator: MatPaginator;

  constructor(
    private appEventEmitter: AppEventEmitter,
    private createUserDialog: MatDialog,
    private userService: UserService,
    private snackBar: MatSnackBar,
  ) {
  }

  ngOnInit() {
    this.loadUsers(1);

    this.subscribeEvents();
  }

  ngOnDestroy() {
    this.unsubscribeEvents();
  }

  private unsubscribeEvents() {
    this.usersPaginator.page.unsubscribe();
  }

  private subscribeEvents() {
    this.usersPaginator.page.subscribe(event => {
      this.loadUsers(this.usersPaginator.pageIndex + 1);
    });

    merge(
      this.appEventEmitter.onUserSaved
    ).subscribe(data => {
      if (data) {
        this.loadUsers(1);
      }
    });
  }

  private loadUsers(page: number) {
    this.appEventEmitter.loadingState.next(true);

    this.userService.index(page, this.usersPageSize)
      .pipe(
        finalize(() => {
          this.appEventEmitter.loadingState.next(false);
        })
      ).subscribe(
      data => {
        this.usersDataSource = data.entries;
        this.usersTotalElements = data.total_elements;
      },
      res => {
        this.usersDataSource = [];
        this.usersTotalElements = 0;

        const msg = MessageUtil.getErrorMessage(res, 'Could not load the accounts. Please try again.');

        this.snackBar.openFromComponent(MessageComponent, {
          duration: 5000,
          data: {type: MessageComponent.TYPE_ERROR, content: msg}
        });
      });
  }

  private showUserDialog(user: User | {} = null) {
    this.createUserDialog.open(UserDialogComponent, {
      width: '800px',
      autoFocus: true,
      data: user
    });
  }

  onAddUserClicked() {
    this.showUserDialog();
  }

  onEditUserClicked(user: User) {
    this.showUserDialog(user);
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
    FlexLayoutModule,
    UserDialogModule,
    PageHeaderModule
  ],
  exports: [UserComponent],
  declarations: [UserComponent],
})
export class UserModule {
}
