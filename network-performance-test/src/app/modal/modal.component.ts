// import component
import { Component, ViewEncapsulation } from '@angular/core';
import { DashboardService, PropertiesService } from '../../services';
import { DashboardModel} from '../../models';
import { MdDialog, MdDialogRef, MdDialogConfig } from '@angular/material';

declare const MktoForms2: any;

/**
 * @brief      Component declairation
 *
 * @param      selector       The selector
 * @param      templateUrl    The template url
 * @param      styleUrls      The style urls
 * @param      viewProviders  The view providers
 *
 * @return      Modal
 */
@Component({
  selector: 'app-modal',
  styleUrls:  ['./modal.scss'],
  templateUrl: './modal.html',
  viewProviders: [DashboardService],
  encapsulation:  ViewEncapsulation.None,
})

// Modal component
export class ModalComponent {
  bestLatencyRegion: any;
  isSurveyFormOpen: boolean = false;

  /**
   * constructor Modal component
   */
  constructor(public dialogRef: MdDialogRef<ModalComponent>) {}

  /**
   * display survey form
   * [displaySurveyForm description]
   */
  displaySurveyForm() {
    if(!this.isSurveyFormOpen){
      this.isSurveyFormOpen = true;
  	  MktoForms2.loadForm("//app-ab21.marketo.com", "882-LUR-510", 1088);
    }
  	// MktoForms2.loadForm("//app-ab21.marketo.com", "882-LUR-510", 1005);
  }
}