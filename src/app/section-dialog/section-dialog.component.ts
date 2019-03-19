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
import {Section} from '../core/models/section.model';
import {SectionService} from '../core/services/section.service';
import {MessageComponent} from '../message/message.component';
import {finalize} from 'rxjs/operators';
import {MessageUtil} from '../core/utils/message.util';
import {BehaviorSubject} from 'rxjs';


@Component({
  selector: 'app-section-dialog',
  templateUrl: './section-dialog.component.html',
  styleUrls: ['./section-dialog.component.scss'],
  providers: [
  ]
})
export class SectionDialogComponent implements OnInit {
  sectionForm: FormGroup;

  isSubmitting = false;

  private savedSectionData: {} = null;

  allSections: Section[] = [];
  selectedChildSections: BehaviorSubject<Section[]> = new BehaviorSubject([]);
  translateParams: {};

  @ViewChild('nameInput') nameInput: MatInput;

  constructor(
    private snackBar: MatSnackBar,
    private sectionService: SectionService,
    @Inject(MAT_DIALOG_DATA) public data = {} as Section,
    private dialogRef: MatDialogRef<SectionDialogComponent>,
    private appEventEmitter: AppEventEmitter
  ) { }

  ngOnInit() {
    this.buildSectionForm();

    this.subscribeServices();
  }

  private subscribeServices() {
    this.sectionService.getAll().subscribe(
      data => {
        this.allSections = data;

        if (this.data) {
          this.updateChildSections(this.allSections, this.data.child_section_ids);
        }
      }, error => {
        this.allSections = [];
        this.selectedChildSections.next([]);
      });

    this.selectedChildSections.subscribe(
      data => {
        const selectedSectionIds = data.map(val => val.id);
        this.sectionForm.get('child_section_ids').setValue(selectedSectionIds);
      },
      error => {
        this.sectionForm.get('child_section_ids').setValue([]);
      });
  }

  private updateChildSections(sections: Section[], childSectionIds: number[]) {
    const childSections = SectionService.findChildrenSections(sections, childSectionIds);
    this.selectedChildSections.next(childSections);
  }

  private getSectionFormData() {
    const data = this.sectionForm.value;

    if (this.isEditSection()) {
      data.id = this.data.id;
    }

    return data;
  }

  private createOrUpdateSection() {
    Logger.info(SectionDialogComponent.name, 'createOrUpdateSection', this.sectionForm.value);

    this.isSubmitting = true;

    this.savedSectionData = null;

    if (this.sectionForm.valid) {
      const sectionData = this.getSectionFormData();

      const observable = this.isEditSection() ?
        this.sectionService.update(sectionData) : this.sectionService.create(sectionData);

      observable
        .pipe(
          finalize(() => {
            this.isSubmitting = false;
          })
        ).subscribe(
          data => {
            this.savedSectionData = sectionData;

            this.resetForm();

            this.snackBar.openFromComponent(MessageComponent, {
              duration: 5000,
              data: {type: MessageComponent.TYPE_SUCCESS, content: data.msg}
            });

            this.appEventEmitter.onSectionSaved.next(true);
          },
        res => {
          Logger.info(SectionDialogComponent.name, 'createOrUpdateSection', res);

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

  private resetForm() {
    if (!this.isEditSection()) {
      this.sectionForm.reset();

      if (this.data) {
        this.sectionForm.get('parent_id').setValue(this.data.parent_id);
        this.sectionForm.get('child_section_ids').setValue(this.data.child_section_ids);
        this.sectionForm.get('is_display').setValue(1);
      }
    }

    this.nameInput.focus();
  }

  private setFormFieldsAsTouched() {
    Object.keys(this.sectionForm.controls).forEach(key => {
      this.sectionForm.controls[key].markAsTouched();
    });
  }

  private isEditSection() {
    return this.data && this.data.id;
  }

  private buildSectionForm() {

    let nameVal = '';
    let descVal = '';
    let actionKeyVal = '';
    let isDisplayVal = 1;

    let parentIdVal = null;
    let childSectionIdsVal = [];

    if (this.data) {
      parentIdVal = this.data.parent_id;
      childSectionIdsVal = this.data.child_section_ids;
    }

    if (this.isEditSection()) {
      nameVal = this.data.name;
      descVal = this.data.desc;
      actionKeyVal = this.data.action_key;
      isDisplayVal = this.data.is_display;
    }

    this.sectionForm = new FormGroup({
      name: new FormControl(nameVal, {
        validators: [Validators.required]
      }),
      desc: new FormControl(descVal),
      parent_id: new FormControl(parentIdVal),
      is_display: new FormControl(isDisplayVal),
      child_section_ids: new FormControl(childSectionIdsVal),
      action_key: new FormControl(actionKeyVal, {
        validators: [Validators.required]
      })
    });
  }

  onSaveSectionClicked() {
    this.createOrUpdateSection();
  }

  onCloseDialogClicked() {
    Logger.info(SectionDialogComponent.name, 'onCloseDialogClicked', this.savedSectionData);

    this.dialogRef.close(this.savedSectionData);
  }

  getTitle() {
    this.translateParams = {title: this.data ? this.data.name : null};

    return this.isEditSection() ? 'section.edit_dialog_title' : 'section.new_dialog_title';
  }


  onChildSectionsChanged(event: MatSelectChange) {
    this.updateChildSections(this.allSections, event.value);
  }

  removeSelectedChildSection(section: Section) {
    const remainingSelectedChildSections = this.selectedChildSections.value.filter(value => value.id !== section.id);
    this.selectedChildSections.next(remainingSelectedChildSections);
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
  exports: [SectionDialogComponent],
  declarations: [SectionDialogComponent],
  entryComponents: [SectionDialogComponent]
})
export class SectionDialogModule {
}
