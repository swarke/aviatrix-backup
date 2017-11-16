// Import components
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PropertiesService } from '../../services';

/**
 * Component declairation
 * @param {ViewEncapsulation.None}} {  selector [description]
 * @param      selector       The selector
 * @param      templateUrl    The template url
 * @param      styleUrls      The style urls
 * @param      viewProviders  The view providers 
 */
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  encapsulation: ViewEncapsulation.None
})

/**
 * Footer component
 */
export class FooterComponent implements OnInit {
  
  /**
   * Contructor for Footer component
   */
  constructor(public properties: PropertiesService,
  			  private titleService: Title,
          private router: Router,
          private route:ActivatedRoute) {
  	this.initToolName();
  }

  ngOnInit() {
  }

  /**
   * Set the title 
   */
  initToolName() {
    this.titleService.setTitle('Cloud Network Tools (powered by Aviatrix)');
  }
}
