import {Component, Inject, NgModule, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatButtonModule,
  MatChipsModule,
  MatDialogModule,
  MatDialogRef,
  MatFormFieldModule,
  MatIconModule,
  MatInput,
  MatInputModule,
  MatProgressBarModule,
  MatSelectChange,
  MatSelectModule,
  MatSlideToggleModule,
  MatSnackBar,
  MatSnackBarModule
} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import {Logger} from '../core/utils/logger';
import {CoreModule} from '../core/core.module';
import {AppEventEmitter} from '../core/services/app-event-emitter.service';
import {Role} from '../core/models/role.model';
import {RoleService} from '../core/services/role.service';
import {MessageComponent} from '../message/message.component';
import {finalize} from 'rxjs/operators';
import {Section} from '../core/models/section.model';
import {SectionService} from '../core/services/section.service';
import {MessageUtil} from '../core/utils/message.util';

@Component({
  selector: 'app-role-dialog',
  templateUrl: './role-dialog.component.html',
  styleUrls: ['./role-dialog.component.scss'],
  providers: []
})
export class RoleDialogComponent implements OnInit {
  roleForm: FormGroup;

  isSubmitting = false;

  private savedRoleData: {} = null;
  allSections: Section[] = [];
  selectedSections: Section[] = [];

  translateParams: {};

  @ViewChild('nameInput') nameInput: MatInput;

  constructor(
    private snackBar: MatSnackBar,
    private roleService: RoleService,
    private sectionService: SectionService,
    @Inject(MAT_DIALOG_DATA) public data = {} as Role,
    private dialogRef: MatDialogRef<RoleDialogComponent>,
    private appEventEmitter: AppEventEmitter
  ) {
  }

  ngOnInit() {
    this.buildRoleForm();

    this.subscribeServices();
  }

  private subscribeServices() {
    this.sectionService.getAllVisible().subscribe(
      data => {
        this.allSections = data;

        if (this.data) {
          this.selectedSections = SectionService.findChildrenSections(this.allSections, this.data.section_ids);
        }
      }, error => {
        this.allSections = [];
        this.selectedSections = [];
      });
  }

  private getRoleFormData() {
    const data = this.roleForm.value;

    if (this.isEditRole()) {
      data.id = this.data.id;
    }

    return data;
  }

  private createOrUpdateRole() {
    Logger.info(RoleDialogComponent.name, 'createOrUpdateRole', this.roleForm.value);

    this.isSubmitting = true;

    this.savedRoleData = null;

    if (this.roleForm.valid) {
      const roleData = this.getRoleFormData();

      const observable = this.isEditRole() ?
        this.roleService.update(roleData) : this.roleService.create(roleData);

      observable
        .pipe(
          finalize(() => {
            this.isSubmitting = false;
          })
        ).subscribe(
        data => {
          this.savedRoleData = roleData;

          this.resetForm();

          this.snackBar.openFromComponent(MessageComponent, {
            duration: 5000,
            data: {type: MessageComponent.TYPE_SUCCESS, content: data.msg}
          });

          this.appEventEmitter.onRoleSaved.next(true);
        },
        res => {
          Logger.info(RoleDialogComponent.name, 'createOrUpdateRole', res);

          const msg = MessageUtil.getErrorMessage(res);

          this.snackBar.openFromComponent(MessageComponent, {
            duration: 5000,
            data: {type: MessageComponent.TYPE_ERROR, content: msg}
          });
        });
    } else {
      this.setFormFieldsAsTouched();

      this.snackBar.openFromComponent(MessageComponent, {
        duration: 5000,
        data: {
          type: MessageComponent.TYPE_ERROR,
          content: 'message.enter_required_information'
        }
      });

      this.isSubmitting = false;
    }
  }

  private setFormFieldsAsTouched() {
    Object.keys(this.roleForm.controls).forEach(key => {
      this.roleForm.controls[key].markAsTouched();
    });
  }

  private isEditRole() {
    return this.data && this.data.id;
  }

  private resetForm() {
    if (!this.isEditRole()) {
      this.roleForm.reset();
    }

    this.nameInput.focus();
  }

  private buildRoleForm() {

    let nameVal = '';
    let titleVal = '';
    let descriptionVal = '';
    let isAdminVal = false;

    let sectionIdsVal = [];

    if (this.data) {
      sectionIdsVal = this.data.section_ids;
    }

    if (this.isEditRole()) {
      nameVal = this.data.name;
      titleVal = this.data.title;
      descriptionVal = this.data.description;
      isAdminVal = this.data.is_admin;
    }

    this.roleForm = new FormGroup({
      name: new FormControl(nameVal, {
        validators: [Validators.required]
      }),
      title: new FormControl(titleVal, {
        validators: [Validators.required]
      }),
      description: new FormControl(descriptionVal),
      is_admin: new FormControl(isAdminVal),
      section_ids: new FormControl(sectionIdsVal)
    });
  }

  onSaveRoleClicked() {
    this.createOrUpdateRole();
  }

  onCloseDialogClicked() {
    Logger.info(RoleDialogComponent.name, 'onCloseDialogClicked', this.savedRoleData);

    this.dialogRef.close(this.savedRoleData);
  }

  getTitle() {
    this.translateParams = {title: this.data ? this.data.name : null};

    return this.isEditRole() ? 'role.edit_dialog_title' : 'role.new_dialog_title';
  }

  onSectionIdsChanged(event: MatSelectChange) {
    this.selectedSections = SectionService.findChildrenSections(this.allSections, event.value);
  }

  removeSelectedSection(section: Section) {
    const index = this.selectedSections.findIndex(value => value.id === section.id);

    if (index >= 0) {
      this.selectedSections.splice(index, 1);

      const selectedSectionIds = this.selectedSections.map(value => value.id);

      this.roleForm.get('section_ids').setValue(selectedSectionIds);
    }
  }
}

@NgModule({
  imports: [
    CoreModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatChipsModule,
    FlexLayoutModule
  ],
  exports: [RoleDialogComponent],
  declarations: [RoleDialogComponent],
  entryComponents: [RoleDialogComponent]
})
export class RoleDialogModule {
}
