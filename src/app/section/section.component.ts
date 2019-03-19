import {Component, NgModule, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CoreModule} from '../core/core.module';
import {
  MatButtonModule,
  MatCardModule,
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
import {Section} from '../core/models/section.model';
import {merge} from 'rxjs';
import {SectionDialogComponent, SectionDialogModule} from '../section-dialog/section-dialog.component';
import {SectionService} from '../core/services/section.service';
import {finalize} from 'rxjs/operators';
import {MessageComponent} from '../message/message.component';
import {MessageUtil} from '../core/utils/message.util';
import {PageHeaderModule} from '../page-header/page-header.component';

@Component({
  selector: 'app-feature',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss']
})
export class SectionComponent implements OnInit, OnDestroy {

  sectionsDataSource: Section[] = [];
  sectionsTotalElements = 0;

  sectionsPageSize = 30;

  tableColumns = ['title', 'display', 'actions'];
  innerTableColumns = ['title', 'display', 'child_sections', 'actions'];

  @ViewChild('sectionsPaginator') sectionsPaginator: MatPaginator;

  constructor(
    private appEventEmitter: AppEventEmitter,
    private createSectionDialog: MatDialog,
    private sectionService: SectionService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.loadSections(1);

    this.subscribeEvents();
  }

  ngOnDestroy() {
    this.unsubscribeEvents();
  }

  private unsubscribeEvents() {
    this.sectionsPaginator.page.unsubscribe();
  }

  private subscribeEvents() {
    this.sectionsPaginator.page.subscribe(event => {
      this.loadSections(this.sectionsPaginator.pageIndex + 1);
    });

    merge(
      this.appEventEmitter.onSectionSaved
    ).subscribe(data => {
      if (data) {
        this.loadSections(1);
      }
    });
  }

  private loadSections(page: number) {
    this.appEventEmitter.loadingState.next(true);

    this.sectionService.index(page, this.sectionsPageSize)
      .pipe(
        finalize(() => {
          this.appEventEmitter.loadingState.next(false);
        })
      ).subscribe(
      data => {
        this.sectionsDataSource = data.entries;
        this.sectionsTotalElements = data.total_elements;
      },
      res => {
        this.sectionsDataSource = [];
        this.sectionsTotalElements = 0;

        const msg = MessageUtil.getErrorMessage(res, 'section.load_list_failed');

        this.snackBar.openFromComponent(MessageComponent, {
          duration: 5000,
          data: {type: MessageComponent.TYPE_ERROR, content: msg}
        });
      });
  }

  private showSectionDialog(section: Section | {} = null) {
    this.createSectionDialog.open(SectionDialogComponent, {
      width: '800px',
      autoFocus: true,
      data: section
    });
  }

  onAddSectionClicked() {
    this.showSectionDialog();
  }

  onEditSectionClicked(section: Section) {
    this.showSectionDialog(section);
  }

  onDeleteSectionClicked(section: Section) {

  }

  onAddChildSectionClicked(section: Section) {
    this.showSectionDialog({ parent_id: section.id });
  }
}


@NgModule({
  imports: [
    CoreModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatTableModule,
    MatChipsModule,
    FlexLayoutModule,
    SectionDialogModule,
    PageHeaderModule
  ],
  exports: [SectionComponent],
  declarations: [SectionComponent],
})
export class SectionModule {
}
