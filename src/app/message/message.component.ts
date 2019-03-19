import {Component, Inject, NgModule, ViewEncapsulation} from '@angular/core';
import {MAT_SNACK_BAR_DATA, MatSnackBarRef} from '@angular/material';
import {CoreModule} from '../core/core.module';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent {
  public static TYPE_ERROR = 'error';
  public static TYPE_WARNING = 'warning';
  public static TYPE_SUCCESS = 'success';
  public static TYPE_INFO = 'info';

  constructor(
    private matSnackBarRef: MatSnackBarRef<MessageComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: { type: null, title: null, content: null },
  ) {
  }
}

@NgModule({
  imports: [
    CoreModule,
  ],
  exports: [MessageComponent],
  declarations: [MessageComponent],
  entryComponents: [MessageComponent]
})
export class MessageModule {
}

