// import components
import { Component, OnInit, AfterViewInit, ViewEncapsulation, Input } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { ChartModule } from 'angular2-highcharts';
import { DashboardModel} from '../../models';
import { Response, Http } from '@angular/http';
import { DashboardService, PropertiesService } from '../../services';
import { MdDialog, MdDialogRef, MdDialogConfig } from '@angular/material';
import {SlimLoadingBarService} from 'ng2-slim-loading-bar';
import { ToastrService } from 'toastr-ng2';
import * as $ from 'jquery';


import { CLOUD_TOOL, AWS_INVENTORY_PATH, AZURE_INVENTORY_PATH, GCE_INVENTORY_PATH} from '../app-config';
declare var jQuery:any;

declare const L: any;

declare const google: any;

declare const AmCharts: any;

declare const Ping: any

declare const MktoForms2: any;

/**
 * @brief      Component declairation
 *
 * @param      selector       The selector
 * @param      templateUrl    The template url
 * @param      styleUrls      The style urls
 * @param      viewProviders  The view providers
 *
 * @return      View for the network performance tool
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  viewProviders: [DashboardService],
  encapsulation: ViewEncapsulation.None
})

/**  Class for Dashboard Component */
export class DashboardComponent implements AfterViewInit  {
  clouds: any;
  @Input() tool: string;
  progressFactor: number = 0;

  options: any;
  latencyOptions: any;
  isTestCompleted: boolean;
  responseTimeOptions: any;
  packetLossOptions: any;
  lat: number;
  lng: number;
  geoLocation: any;
  errorMessage: any;
  locations: any[];
  inventory: any;
  dashboardModel: DashboardModel;
  pingStartTime: any =  null;
  latency: any;
  responseTime: any;
  latencyChart: any;
  disabledStart: any;
  responseTimeChart : any;
  selectedRegions: any;
  bestRegion: any;
  worstRegion: any;
  bestLatencyRegion: any;
  mapStyles: any;
  isDesc: boolean;
  sortableColumn: any;
  leftPanelHeader:any;
  inventoryPath: any;
  cloudPinPath: any;
  chartColors: any;
  userLocation: any;
  isPopupOpen: boolean;
  isTestStopped: boolean;
  timeout = [];
  visibleSortOption: boolean;
  isEmailPopOpen: boolean;
  isFormsubmitted: boolean;
  toolUserEmail: any = '';

  testStartTime: any;

  TEST_MINUTES: number = 35;
  TEST_MINUTES_LATENCY: number = 25;
  TEST_INTERVAL: number = 5000;
  counter: number = 0;

  public zoom = 15;
  public opacity = 1.0;
  public width = 5;
  text = '';
  hoveredObject = null;
  beginTest: boolean = false;
  AWS_CLOUD: boolean = false;
  AZURE_CLOUD: boolean = false;
  GCE_CLOUD: boolean = false;

  sourceLocation: any = null;

  /**
   * Declare all required parameters and providers
   * @param {Http}                  private http                   http service
   * @param {DashboardService}      private dashboardService       API integration service
   * @param {PropertiesService}     public  properties             externalies properties
   * @param {MdDialog}              public  dialog                 dialog popup
   * @param {SlimLoadingBarService} private slimLoadingBarService  progress bar
   * @param {ToastrService}         public  toasterService         toster popup
   */
  constructor(private http: Http,
              private dashboardService: DashboardService,
              public properties: PropertiesService,
              public dialog: MdDialog,
              private slimLoadingBarService: SlimLoadingBarService,
              public toasterService: ToastrService) {
      /**
       * Chart colors
       */
      this.chartColors = ['#2196F3', '#F44336', '#FF609E', '#14936C', '#00FF4F', '#A99000',
      '#E8C21A', '#673AB7', '#3D495A', '#536DFE', '#C3429B', '#C33A38',
      '#02BCA1', '#25DB67', '#6F9900', '#E69500', '#D792F1', '#83A1CD',
      '#0E7BBC', '#81D4FA', '#EF9A9A', '#81D4FA', '#BDDB75', '#F9C18F',
      '#A4BAB9', '#FF5E5A', '#2AACF4', '#8CB723', '#EFAA0F', '#5AA8A8',
      '#B71C1C', '#0D47A1', '#006600', '#FF9739', '#1B778C', '#46466D',
      '#E65100', '#1D5663', '#FF8ABF', '#9DEF6C', '#FF008C', '#AEC2D6',
      '#42E505', '#D1A579', '#C91871', '#8291D1', '#009600', '#C68979',
      '#AD006B', '#2E56BC', '#A55550', '#C1DC83', '#FA43FF', '#5ECCB7',
      '#B7B567', '#844840', '#CC4CB4', '#00AF91', '#A99000', '#FF8DA0',
      '#9E1283', '#007F73', '#F1626E', '#FCEC98', '#E3A5F2', '#A7C9A7',
      '#F7ED77', '#A5270A', '#C372D6', '#87AA77', '#FFDD00', '#D1B1AA',
      '#9D25BA', '#59824A', '#E5C31C', '#8E7A76', '#810687', '#212121'];

      
      this.userLocation = {};
      this.latency = properties.NA_TEXT;
      this.responseTime = properties.NA_TEXT;

      this.lat = properties.NA_LATITUDE;
      this.lng = properties.NA_LONGITUDE;    
      
      this.disabledStart = false;
      this.isDesc = false;
      this.sortableColumn = "";
      this.latencyOptions = null;
      this.responseTimeOptions = null;
      this.latencyChart = null;
      this.responseTimeChart = null;
      this.dashboardModel = new DashboardModel();
  	  this.clouds = [
                	    {value: '0', viewValue: 'All Cloud'},
                	    {value: '1', viewValue: 'Google Cloud'},
                	    {value: '2', viewValue: 'Azure'}
                	  ];
     this.options = [];
     this.inventory = {};
     this.errorMessage = "";
     this.locations = [];
     this.selectedRegions = [];
     this.bestRegion = null;
     this.worstRegion = null;
     this.bestLatencyRegion = null;
     this.isTestCompleted = false;
     this.isPopupOpen = false;
     this.isTestStopped = false;
     this.visibleSortOption = false;
     this.isEmailPopOpen = false;
     this.isFormsubmitted = false;

  }

  /**
   * Open modal to show best latency
   */
  openDialog() {
    this.visibleSortOption = true;
    this.slimLoadingBarService.complete();
     this.slimLoadingBarService.reset();
     this.slimLoadingBarService.progress = 0;
     this.isDesc = false;
     this.sortBy('latency')
   // if(this.bestLatencyRegion.latency != 0.00) {
   //   if(this.bestLatencyRegion.latency != 0.00) {
   //     let config = new MdDialogConfig();
   //     let dialogRef:MdDialogRef<ModalComponent> = this.dialog.open(ModalComponent, config);
   //     dialogRef.componentInstance.bestLatencyRegion = this.bestLatencyRegion;
   //   }
   // }  
   this.toasterService.success(this.properties.TEST_SUCCESS_MESSAGE);
  }

  /**
   * initialize latency instance
   * [latencyInstance description]
   * @param {[type]} chartInstance [chart instance]
   */
  latencyInstance(chartInstance) {
    this.latencyChart = chartInstance;
  }

  /**
   * responce time instance
   * [responseTimeInstance description]
   * @param {[type]} chartInstance [chart instance]
   */
  responseTimeInstance(chartInstance) {
    this.responseTimeChart = chartInstance;
  }

  /**
   * Get ammap
   * [ngOnInit description]
   */
  ngOnInit(){
    this.generateAmMap();
  }


  openMarketoForm() {
    let self = this;
    self.isEmailPopOpen = true;
    self.isFormsubmitted = true;
    MktoForms2.loadForm("//app-ab21.marketo.com", "882-LUR-510", 1143, function(form) {
        //listen for the validate event
        form.onValidate(function() {
            // Get the values
            var vals = form.vals();
            //Check your condition
            if (vals.Email == "") {
                // Prevent form submission
                form.submittable(false);
                // Show error message, pointed at VehicleSize element
                var emailElem = form.getFormElem().find("#Email");
                form.showErrorMessage("Please enter your email to continue.", emailElem);
            }
            else {
                // Enable submission for those who met the criteria
                form.submittable(true);
            }
        });
        form.onSubmit(function(){
            // Get the form field values
            var vals = form.vals().Email;
            self.toolUserEmail = JSON.stringify(vals);
        });
        // Add an onSuccess handler
        form.onSuccess(function(values, followUpUrl) {
            // Get the form's jQuery element and hide it
            form.getFormElem().hide();
            self.isEmailPopOpen = false;
            self.isFormsubmitted = true;
            // Return false to prevent the submission handler from taking the lead to the follow up url
            return false;
        });
    });
  }

  /**
   * get the geo location of user
   * [ngAfterViewInit description]
   */
  ngAfterViewInit() {
    setTimeout(() => this.generateAmMap(), 50);
    this.initLeftPanelHeader();
    let self = this;
    setTimeout(() =>{
    this.getGeolocation().subscribe((success: any) => {
      try {
        let geoLocations =  JSON.parse(success._body);

        self.userLocation.latitude = geoLocations.location.lat;
        self.userLocation.longitude = geoLocations.location.lng;

        self.userLocation.isOpen = false;
        self.userLocation.iconUrl = '/assets/updated_user_pin.png';
        var geocoder = geocoder = new google.maps.Geocoder();
          var latlng = new google.maps.LatLng(self.userLocation.latitude, self.userLocation.longitude);
          geocoder.geocode({ 'latLng': latlng }, function (results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                  if (results[1]) {
                      self.userLocation.address = results[1].formatted_address;
                      let sourceAddress = results[1].formatted_address;
                      let sourceAddressObj = sourceAddress.split(",");
                      self.sourceLocation = sourceAddressObj[sourceAddressObj.length - 3] + ' (' + sourceAddressObj[sourceAddressObj.length - 1].replace(" ", "") + ")" ;
                      self.isInventoryLoaded();
                  }
              }
        });
      } catch(ex) {
      }

      self.getInvetory();

    }, (error: any) => {
      self.getInvetory();
    });}, 20);
  }

  isInventoryLoaded() {
    if(this.locations && AmCharts && this.locations.length > 0) {
      this.startTest();
    } else {
      setTimeout(()=>this.isInventoryLoaded(), 10);
    }
  }
  /**
   * Initialize left panel header
   * [initLeftPanelHeader description]
   */
  initLeftPanelHeader() {
    if(this.tool.toUpperCase() === this.properties.AWS) {
     this.leftPanelHeader = this.properties.LEFT_PANEL_AWS_REGION;
     this.inventoryPath = AWS_INVENTORY_PATH;
     this.cloudPinPath = this.properties.AWS_CLOUD_PIN_PATH;
     this.AWS_CLOUD = true;
    } else if(this.tool.toUpperCase() === this.properties.AZURE) {
     this.leftPanelHeader = this.properties.LEFT_PANEL_AZURE_REGION;
     this.inventoryPath = AZURE_INVENTORY_PATH;
     this.cloudPinPath = this.properties.AZURE_CLOUD_PIN_PATH;
     this.AZURE_CLOUD = true;
    } else  if(this.tool.toUpperCase() === this.properties.GCE) {
     this.leftPanelHeader = this.properties.LEFT_PANEL_GCE_REGION;
     this.inventoryPath = GCE_INVENTORY_PATH;
     this.cloudPinPath = this.properties.GCE_CLOUD_PIN_PATH;
     this.GCE_CLOUD = true;
    }
  }

  /**
   * Get the current geo location of user
   * [getCurrentGeoLocation description]
   */
  getCurrentGeoLocation() {
     let current = this;
      this.getGeolocation().subscribe((geoLocation:   any) => {
      current.geoLocation = JSON.parse(geoLocation._body);
       let locs: any[] = current.geoLocation.loc.split(',');
       current.lat = parseFloat(locs[0]);
       current.lng = parseFloat(locs[1]);
       current.locations.push({
                              lat: parseFloat(locs[0]),
                              lng: parseFloat(locs[1]),
                              label: 'User location : ' + current.geoLocation.city,
                              draggable: false
                            });

       for(let index = 0; index < this.inventory.data.length; index++) {
         let obj = this.inventory.data[index];
         current.locations.push(obj);
       }
    })
  }

  /**
   * get the geo location from google api
   * [getGeolocation description]
   */
  getGeolocation() {
   return this.http.post('https://www.googleapis.com/geolocation/v1/geolocate?key=' + this.properties.GOOGLE_API_KEY, {});
  };

  /**
   * get series data
   * [getSeriesData description]
   * @param {[any]} chartType [type of chart]
   * @param {[any]} name      [name of series]
   * @param {[any]} data      [list of data]
   */
  getSeriesData(chartType: any, name: any, data: any, color: any) {
    return {
              type:   chartType,
              name:   name,
              data:   data,
              color: color,
              dataLabels : {
                    enabled : false
              },
              shadow: {
                width: 3,
                offsetX: 0,
                offsetY: 0,
                opacity: 0.06
            }
    };
  }

  /**
   * get the chart configuration
   * [getChartConfig description]
   * @param {[any]} title     [title for chart]
   * @param {[any]} unit      [unit for chart]
   * @param {[any]} series    [series for chart]
   * @param {[any]} chartType [type of chart]
   */
  getChartConfig (title: any, unit: any, series: any, chartType: any) {
     const options = {
          chart:   { type:  chartType, zoomType:   'xy',
                      style: {
                        fontFamily: 'Roboto, sans-serif'
                      }
           },
          title :   { text :   title },
          // colors: this.chartColors,
          global :   {
            useUTC :   false,
          },
          xAxis:   {
              type:   'datetime',
              tickInterval: 5000,
              dateTimeLabelFormats: {
                second: '%H:%M:%S'
              },
              title: {
                    text: 'Time'
                  },
              startOnTick: true,
          },
          yAxis:   {
                  labels:   {
                    format: '{value}'
                  },
                  title:   {
                    text: unit
                  }
          },
          series: series
      };
      return options;
    }

  /**
   * [getChartData description]
   * @param {[type]} chartData [chart data]
   */
  getChartData(chartData) {
    const metricData: any = [];
    for (let index = 0; index < chartData.length; index++) {
      const jsonObj = chartData[index];
      const date: Date = new Date(jsonObj.time);
      let yVal = jsonObj.value;
      metricData.push([Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(),
      date.getHours(), date.getMinutes(), date.getSeconds()), yVal]);
    }
    return metricData;
  }

  /**
   * [getChartPoint description]
   * @param {[type]} date  [date object] 
   * @param {[type]} value [value of date]
   */
  getChartPoint(date, value) {
    return [Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(),
         date.getHours(), date.getMinutes(), date.getSeconds()), value];
  }

  /**
   * Set Latency And Bandwidth MockData 
   */
  setLatencyAndBandwidthMockData() {
      let latData = [
        [{"value": 628}, {"value": 365}, {"value": 445}, {"value": 379}, {"value": 438}, {"value": 32023}],
        [{"value": 341}, {"value": 281}, {"value": 343}, {"value": 264}, {"value": 320}, {"value": 30889}],
        [{"value": 125}, {"value": 120}, {"value": 282}, {"value": 97}, {"value": 148}, {"value": 289}],
        [{"value": 280}, {"value": 209}, {"value": 276}, {"value": 227}, {"value": 275}, {"value": 10856}],
        [{"value": 359}, {"value": 301}, {"value": 364}, {"value": 314}, {"value": 372}, {"value": 25829}],
        [{"value": 647}, {"value": 394}, {"value": 481}, {"value": 1059}, {"value": 430}, {"value": 31912}],
        [{"value": 647}, {"value": 402}, {"value": 472}, {"value": 417}, {"value": 436}, {"value": 34775}],
        [{"value": 499}, {"value": 284}, {"value": 312}, {"value": 330}, {"value": 363}, {"value": 23742}],
        [{"value": 336}, {"value": 292}, {"value": 311}, {"value": 311}, {"value": 372}, {"value": 22715}],
        [{"value": 634}, {"value": 469}, {"value": 446}, {"value": 484}, {"value": 479}, {"value": 35691}],
        [{"value": 116}, {"value": 97}, {"value": 149}, {"value": 99}, {"value": 187}, {"value": 275}],
        [{"value": 819}, {"value": 621}, {"value": 644}, {"value": 601}, {"value": 36784}, {"value": 32660}],
        [{"value": 742}, {"value": 449}, {"value": 506}, {"value": 426}, {"value": 418}, {"value": 31659}],
        [{"value": 773}, {"value": 527}, {"value": 506}, {"value": 441}, {"value": 416}, {"value": 27577}]
      ];
      let bandData = [
        [{"value": 0.35}, {"value": 0.37}, {"value": 0.36}, {"value": 0.38}, {"value": 0.39}, {"value": 0.35}],
        [{"value": 0.4}, {"value": 0.35}, {"value": 0.43}, {"value": 0.38}, {"value": 0.47}, {"value": 0.52}],
        [{"value": 1.06},{"value": 0.95}, {"value": 0.83}, {"value": 0.98}, {"value": 0.86}, {"value": 0.77}],
        [{"value": 0.57}, {"value": 0.51}, {"value": 0.54}, {"value": 0.44}, {"value": 0.52}, {"value": 0.47}],
        [{"value": 0.4}, {"value": 0.43}, {"value": 0.45}, {"value": 0.48}, {"value": 0.39}, {"value": 0.51}],
        [{"value": 0.36}, {"value": 0.36}, {"value": 0.4}, {"value": 0.36}, {"value": 0.41}, {"value": 0.34}],
        [{"value": 0.34}, {"value": 0.37}, {"value": 0.39}, {"value": 0.39}, {"value": 0.4}, {"value": 0.36}],
        [{"value": 0.42}, {"value": 0.4}, {"value": 0.41}, {"value": 0.48}, {"value": 0.43}, {"value": 0.45}],
        [{"value": 0.48}, {"value": 0.41}, {"value": 0.44}, {"value": 0.52}, {"value": 0.44}, {"value": 0.43}],
        [{"value": 0.36}, {"value": 0.39}, {"value": 0.3}, {"value": 0.42}, {"value": 0.37}, {"value": 0.38}],
        [{"value": 5.14}, {"value": 4.31}, {"value": 3.68}, {"value": 1.73}, {"value": 1.57}, {"value": 1.43}],
        [{"value": 0.33}, {"value": 0.4}, {"value": 0.31}, {"value": 0.44}, {"value": 0.38}, {"value": 0.4}],
        [{"value": 0.39}, {"value": 0.41}, {"value": 0.32}, {"value": 0.4}, {"value": 0.42}, {"value": 0.35}],
        [{"value": 0.38}, {"value": 0.36}, {"value": 0.47}, {"value": 0.42}, {"value": 0.36}, {"value": 0.35}]
      ]
      for(let index = 0; index < this.locations.length; index++) {
        let object: any = this.locations[index];
        object.latencyCompleted = true;
        object.latency = null;
        object.dashboardModel = new DashboardModel();
        object.dashboardModel.latency = latData[index];
    }
  }

  /**
   * Test Average Latency
   */
  testAverageLatencyBandwidth() {
    this.setLatencyAndBandwidthMockData();
    for(let index = 0; index < this.locations.length; index++) { 
      this.getLatency(this.locations[index]);
      // console.log('Region: ' + this.locations[index]['region_name'] + ' Latency: ' + this.locations[index]['latency'])
    }
    this.isTestCompleted = true;
      this.getBestLatencyAndBandwidth();
      this.disabledStart = false;
      this.isPopupOpen = true;
      this.openDialog();
  }

  /**
   * Starts test for calculating the statistics
   * [startTest description]
   */
  startTest() {
    for (var i=0; i<this.timeout.length; i++) {
      clearTimeout(this.timeout[i]);
    }
    // Start progress bar
    this.visibleSortOption = false;
    this.counter = 0;
    this.isTestStopped = false;
    this.beginTest = true;
    this.slimLoadingBarService.progress = 0;
    // Disabling start button
    this.disabledStart = true;
    this.isTestCompleted = false;
    this.isPopupOpen = false;

    // Reseting statistics.
    this.latency =  this.properties.NA_TEXT;
    this.responseTime = this.properties.NA_TEXT;
    this.bestLatencyRegion = null;

    this.testStartTime = new Date();

    // Setting latency chart configuration
    let latencySeries: any = [];

    // Setting latency chart configuration
    let badwidthSeries: any = [];

    // Starting test for regions
    for(let index = 0; index < this.locations.length; index++) {
      let object: any = this.locations[index];
      object.latencyCompleted = false;
      object.latency = null;
      object.dashboardModel = new DashboardModel();
      object.currentLatencyIndex = 0;
      object.currentResponseIndex = 0;
      object.firstLatencyPass = false;
      object.pingStartTime = new Date();

      // Setting up latency chart
      this.setDataPoint(object.dashboardModel.latency, object);
      latencySeries.push(this.getSeriesData('spline', object.label, this.getChartData(object.dashboardModel.latency), object.color));
      // setTimeout(()=>this.setLatency(index),10);
    }
    this.latencyOptions = this.getChartConfig('', this.properties.MILISECONDS, latencySeries, 'spline');
    this.impl_set_latency();
  }

  impl_set_latency() {
     
     if (this.getTimeDiffInSeconds(this.testStartTime, 0) < this.TEST_MINUTES && this.counter <= 4) {
        this.timeout.push(setTimeout(() =>this.impl_set_latency(), this.TEST_INTERVAL));
        if(!this.isFormsubmitted && this.getTimeDiffInSeconds(this.testStartTime, 0) > 5) {
          this.openMarketoForm();
        }
     } else {
       setTimeout(() => this.isProcessCompleted(), 5);
     }
    this.counter += 1;
    this.setLatency(0);
  }

  /**
   * set data point on map
   * [setDataPoint description]
   * @param {[type]} data [data for pin]
   * @param {[type]} obj  [object of region]
   */
  setDataPoint(data, obj) {
    for (var index = 0; index < 6; index++) {
      if (index == 0) {
        data.push({'time': new Date(), 'value': null});
      } else {
        let date = new Date()
        date.setSeconds(obj.pingStartTime.getSeconds() + (index * 5));
        data.push({'time': date, 'value': null});
      }
    }
  } 

  /**
   * get the time diff
   * [getTimeDiff description]
   */
  getTimeDiff() {
    let endTime:any = new Date();
    let diff: any = endTime - this.pingStartTime;
    var diffMins = Math.round(((diff % 86400000) % 3600000) / 60000);
    return diffMins;
  }


  /**
   * get time diff in seconds
   * [getTimeDiffInSeconds description]
   */
  getTimeDiffInSeconds(pingStartTime, index) {
    let endTime:any = new Date();
    let diff: any = endTime.getTime() - pingStartTime.getTime();
    var diffSec = diff/ 1000;
    return diffSec;
  }
 
  /**
   * set latency
   * [setLatency description]
   * @param {any} index [index of region]
   */
  setLatency(index: any) {
    if(index >= this.locations.length) {

      return;
    } 
    let obj = this.locations[index];
    let current = this;
    var download = new Image() ;
    let pingStart = new Date();
    var cacheBuster = "?nnn=" + pingStart;
    var cachebuster = Math.floor(new Date().getTime() / 1000);
    let ping = new Ping();
    ping.ping(obj.url, function(error, delta1) {
      pingStart = new Date();
      ping.ping(obj.url, function(error, delta2) {
          if(!current.isTestStopped) {
            let max = delta1 < delta2 ? delta1:delta2;
            // if(obj && obj.dashboardModel && obj.dashboardModel.latency){
              obj.dashboardModel.latency[obj.currentLatencyIndex].value = max;
            // }
            current.slimLoadingBarService.progress += current.progressFactor;
            // if(current.latencyChart && current.latencyChart.series[index] && current.latencyChart.series[index].data)
            // {
              current.latencyChart.series[index].data[obj.currentLatencyIndex].update({"y": max});
            // }
            obj.currentLatencyIndex++;
            if (obj.currentLatencyIndex > 5) {
              obj.latencyCompleted = true;
            } 
            current.setLatency(index + 1);
        } 
      });
    });

        // let url = obj['url'] + 'ping' + cacheBuster;

        // var ajaxSizeRequest = $.ajax({
        //     type: "HEAD",
        //     async: true,
        //     url: url,
        //     crossDomain : true,
        //     error: function(message){
        //       var pingStart = new Date();
        //       var cacheBuster = "?nnn=" + pingStart;
        //       url = obj['url'] + 'ping' + cacheBuster;
        //       ajaxSizeRequest = $.ajax({
        //           type: "GET",
        //           async: true,
        //           crossDomain : true,
        //           url: url,
        //           error: function(message){
        //             if (obj.firstLatencyPass && !current.isPopupOpen) {
        //               if(!current.isTestStopped) {
        //                 let pingEnd = new Date();
        //                 let ping: number = (pingEnd.getTime() - pingStart.getTime());
        //                 console.log('Region: ' + obj.region_name + ' Latency: ' + Math.round(ping));
        //                 // clearTimeout(obj.timeout);
        //                 obj.dashboardModel.latency[obj.currentLatencyIndex].value = Math.round(ping);
        //                 current.latencyChart.series[index].data[obj.currentLatencyIndex].update({"y": Math.round(ping)});
        //                 obj.currentLatencyIndex++;
        //                 current.slimLoadingBarService.progress += current.progressFactor;
        //                 if (obj.currentLatencyIndex > 5) {
        //                   obj.latencyCompleted = true;
        //                 }
        //               } else {
        //                 current.getLatency(obj);
        //                  obj.latencyCompleted = true;
        //                 if(!current.disabledStart) {
        //                   setTimeout(() => current.isProcessCompleted(), 5);
        //                 }
        //               }
                      
        //             } else {
        //               obj.firstLatencyPass = true;
        //             }
        //           }
        //       });
        //     }
        // });

        // pingStart = new Date();
        // download.onerror = function() {
        //   let pingEnd = new Date();
        //   let ping1: number = (pingEnd.getTime() - pingStart.getTime());
        //   pingStart = new Date();
        //   cacheBuster = "?nnn=" + pingStart;
        //   cachebuster = Math.floor(new Date().getTime() / 1000);
        //   pingStart = new Date();
        //   download.onerror = function() {
        //     // if (obj.firstLatencyPass && !current.isPopupOpen) {
        //         if(!current.isTestStopped) {
        //           let pingEnd = new Date();
        //           let ping2: number = (pingEnd.getTime() - pingStart.getTime());
        //           let max = ping1 < ping2 ? ping1:ping2;
        //           current.slimLoadingBarService.progress += current.progressFactor;
        //           obj.dashboardModel.latency[obj.currentLatencyIndex].value = Math.floor(max);
        //           current.latencyChart.series[index].data[obj.currentLatencyIndex].update({"y": Math.floor(max)});
        //           if (obj.currentLatencyIndex >= 5) {
        //             obj.latencyCompleted = true;
        //           }
        //           obj.currentLatencyIndex++;
        //           current.setLatency(index + 1);
        //         } else {
        //           current.getLatency(obj);
        //            obj.latencyCompleted = true;
        //           if(!current.disabledStart) {
        //             setTimeout(() => current.isProcessCompleted(), 5);
        //           }
        //         }
                
        //   }
        //   download.src = obj.url +'ping' + cacheBuster;
        // }
        // download.src = obj.url +'ping' + cacheBuster ;
  }

  /**
   * get latency
   * [getLatency description]
   * @param {[type]} obj [object of dashboard model]
   */
  getLatency(obj) {
    if (obj.dashboardModel.latency.length > 0) {
      let _latency:number = 0;
      let _total_Latency_request = 0;
      for (let index = 0 ; index < obj.dashboardModel.latency.length; index++) {
        if(null != obj.dashboardModel.latency[index].value && obj.dashboardModel.latency[index].value != 0.00) {
          _latency = _latency + parseFloat(obj.dashboardModel.latency[index].value);
          _total_Latency_request += 1;
        }
      }
     if(_total_Latency_request) {
       obj.latency =  (_latency / _total_Latency_request).toFixed(2);
       // console.log('Region: ' + obj.region_name + ' Average: ' + obj.latency);
     } else {
       obj.latency = 0.00;
     }
    }
  }

  /**
   * set responce time
   * [setResponseTime description]
   * @param {any} index [index of region]
   */
  setResponseTime(index: any) {
    let obj = this.locations[index];

    if (this.getTimeDiffInSeconds(obj.pingStartTime, index) < this.TEST_MINUTES 
        && this.disabledStart && this.isTestStopped) {
       setTimeout(() => this.setResponseTime(index), this.TEST_INTERVAL);
       let pingStart = new Date();
       var cacheBuster = "?nnn=" + pingStart;
       this.dashboardService.getResponseTime(obj.url + this.properties.RESPONSE_TIME_HTML + cacheBuster).subscribe((data:any ) =>{
          let pingEnd = new Date();
          let ping: number = (pingEnd.getTime() - pingStart.getTime());
          obj.dashboardModel.responseTime[obj.currentResponseIndex].value = Math.round(ping);
          this.responseTimeChart.series[index].data[obj.currentResponseIndex].update({"y": Math.round(ping)});
          obj.currentResponseIndex++;
       });
    } else {
      this.getResponseTime(obj);
      obj.responseCompleted = true;
    }
  }

  /**
   * Get the responce time
   * [getResponseTime description]
   * @param {any} obj [object of dashboard model]
   */
  getResponseTime(obj: any) {
    if (obj.dashboardModel.responseTime.length > 0) {
      let _responseTime:number = 0;
      for (let index = 0 ; index < obj.dashboardModel.responseTime.length; index++) {
        if(null != obj.dashboardModel.responseTime[index].value) {
          _responseTime = _responseTime + parseFloat(obj.dashboardModel.responseTime[index].value);
        }
      }
     obj.responseTime =  (_responseTime / obj.dashboardModel.responseTime.length).toFixed(2);
    }
  }

  /**
   * get the best latency
   * [getBestLatency description]
   */
  getBestLatencyAndBandwidth() {
    this.bestLatencyRegion === null;
    for (let index = 0; index < this.locations.length; index++) {
      let object: any = this.locations[index];
      if (this.bestLatencyRegion === null && object.latency) {
        this.bestLatencyRegion = object;
      } else if(this.bestLatencyRegion !== null && object.latency) {
        if(parseFloat(object.latency) < parseFloat(this.bestLatencyRegion.latency)) {
          this.bestLatencyRegion = object;
        }
      }
    }
  }

  /**
   * return true if process is completed else return false
   * [isProcessCompleted description]
   */
  isProcessCompleted() {
    let processCompleted: boolean = false;
      for(let index = 0; index < this.locations.length; index++) {
        let object: any = this.locations[index];
        // console.log("Region: " + object.region_name + " Latency completed: " + object.latencyCompleted);
        if(object.latencyCompleted) {
          this.getLatency(object);
        }
        if (object.latencyCompleted) {
          processCompleted = true;
        } else {
          processCompleted = false;
          break;
        }
      }

    if (processCompleted && !this.isTestCompleted) {
      for(let i =0 ; i < this.locations.length; i++) {
        let obj = this.locations[i];
        let lat = [];
        lat.push(obj.pingStartTime.getHours() + ':' + obj.pingStartTime.getMinutes() + ':' + obj.pingStartTime.getSeconds() + '\t');
        for(let j=0; j < obj.dashboardModel.latency.length - 1; j++) {
          lat.push(obj.dashboardModel.latency[j].value + '\t');
        }
        lat.push(obj.dashboardModel.latency[5].value);
        // console.log('Region: ' + obj.region_name, 'Lat: ' + lat);
      }

      this.isTestCompleted = true;
      this.getBestLatencyAndBandwidth();
      this.disabledStart = false;
      this.isPopupOpen = true;
      this.openDialog();
    } else {
        setTimeout(() => this.isProcessCompleted(), 10);
    }
  }

  /**
   * get the inventory from s3
   * [getInvetory description]
   */
  getInvetory() {

    this.dashboardService.getInventory(this.inventoryPath).subscribe((inventory: any) => {
        this.inventory = JSON.parse(inventory);
        for(let index = 0; index < this.inventory.data.length; index++) {
         let obj = this.inventory.data[index];
         obj.label = obj.region_name;
         obj.isOpen = false;
         
         obj.iconUrl= this.cloudPinPath;
         obj.color = this.chartColors[index];
         this.locations.push(obj);
        }
        // let ping = new Ping();
        // for(let i = 0;  i < this.locations.length; i++) {
        //   ping.ping(this.locations[i]['public_ip'], function(error, delta) {
        //     console.log(' Ping time was ' + String(delta) + ' ms');
        //   });
        // }
        let totalRegions = this.locations.length * 6;
        this.progressFactor = 100/totalRegions;

        // this.generateMap();
        this.generateAmMap();
      },
        (error: any) => {
          this.handleError(error)
          this.toasterService.error(this.properties.INVENTORY_GET_ERROR_MESSAGE)
        }
      );
  }

  handleError(error: any) { }

  /**
   * stop the test
   * [stopTest description]
   */
  stopTest() {
    // set progress bar as complete 
    this.visibleSortOption = true;
    this.isTestStopped = true;
    this.slimLoadingBarService.progress = 0;
    this.slimLoadingBarService.complete();
    this.disabledStart = false;
    for(let index = 0; index < this.locations.length; index++) {
      this.getLatency(this.locations[index]);
    }
    this.getBestLatencyAndBandwidth();
    if(this.bestLatencyRegion) {
      this.openDialog();
    }
    
  }

  /**
   * Update marker label fro region
   * [updateMarkerLabel description]
   * @param {[type]} marker [region of cloud provider]
   */
  updateMarkerLabel(marker) {
    let latency = "";
    let responseTime = "";
    if (marker.latencyCompleted && marker.latency) {
      latency = marker.latency;
    } else if(marker.dashboardModel && marker.dashboardModel.latency
              && marker.dashboardModel.latency.length > 0 && marker.currentLatencyIndex > 0) {
      latency = marker.dashboardModel.latency[marker.currentLatencyIndex - 1].value;
    }

    let content = "";

    // if(latency == "") {
    //   content = "<strong>" + marker.region_name +"</strong>";
    // } else {
    //   content = '<table class="table table-bordered" width="100%">' +
    //                 '<thead>' + 
    //                   '<tr> <th style="text-align: center; border-top: none" colspan="2">'+ marker.region_name +'</th></tr>' +
    //                   '<tr> <th style="text-align: center">'+ "Latency <br> (msec)"+'</th></tr>' +
    //                 '</thead>' +
    //                 '<tbody>' +
    //                   '<tr><td style="text-align: center;">'+(latency == "" ? this.properties.NA_TEXT : latency) +'</td> </tr>' +
    //                 '</tbody>' +
    //               '</table>';
    // }

    if(latency == "") {
      content = "<strong>" + marker.region_name +"</strong>";
    } else {
      content = '<table class="table table-bordered" width="100%">' +
                    '<thead>' + 
                      '<tr> <th style="text-align: center; border-top: none">'+ marker.region_name +'</th></tr>' +
                      '<tr> <th style="text-align: center">'+ "Latency (msec)"+'</th></tr>' +
                    '</thead>' +
                    '<tbody>' +
                      '<tr><td style="text-align: center;">'+(latency == "" ? this.properties.NA_TEXT : latency) +'</td></tr>' +
                    '</tbody>' +
                  '</table>';
    }
    
    return content;
  }

  /**
   * read latest latency 
   * [readLatestLatency description]
   * @param {[type]} obj [object of dashboard model]
   */
  readLatestLatency(obj) {
    if (obj.latencyCompleted && obj.latency) {
      return  obj.latency;
    } else if(obj.dashboardModel && obj.dashboardModel.latency
              && obj.dashboardModel.latency.length > 0 && obj.currentLatencyIndex > 0) {
      return obj.dashboardModel.latency[obj.currentLatencyIndex - 1].value;
    }

    return this.properties.CALCULATING_TEXT;
  }

  /**
   * sort by asc/desc
   * [sortBy description]
   * @param {[type]} property [property of header]
   */
  sortBy (property) {
    this.sortableColumn = property;
    this.isDesc = !this.isDesc; //change the direction    
    let direction = this.isDesc ? 1 : -1;

    this.locations.sort(function(a, b) {
       let aProp = null;
       let bProp = null;
       if(property != 'region_name') {
         if(a[property] != 0.0) {
           aProp = parseFloat(a[property]);
         } else {
           aProp = null;
         }
         if(b[property] != 0.0) {
           bProp = parseFloat(b[property]);
         } else {
           bProp = null;
         }
       } else {
         aProp = a[property];
         bProp = b[property];
       }

       if(aProp === null && bProp) {
            return 1 * direction;
       } else if(bProp === null && aProp) {
            return -1 * direction;
       } else if(aProp < bProp) {
            return -1 * direction;
       } else if(aProp > bProp) {
            return 1 * direction;
       } else{
            return 0;
       }
    });
  }

  /**
   * update chart on marker hover
   * [updateChartOnMarker description]
   * @param {[any]}     marker [regon on marker]
   * @param {[boolean]} hide   [true/false]
   */
  updateChartOnMarker(marker: any, hide: boolean) {
    if (this.latencyChart && this.latencyChart.series) {
      for(let index = 0; index < this.latencyChart.series.length; index++) {
        if(this.latencyChart.series[index].name !== marker.label && hide) {
          this.latencyChart.series[index].setVisible(false, false);
        } else {
          this.latencyChart.series[index].setVisible(true, false);
          if(hide) {
            this.latencyChart.series[index].update({
              dataLabels: {
                  enabled: true
              }
            }, false);
          } else {
            this.latencyChart.series[index].update({
              dataLabels: {
                  enabled: false
              }
            }, false);
          }
        }
      }
      this.latencyChart.redraw();   
    }
  }

  /**
   * generate map
   * [generateMap description]
   */
  generateMap() {
    let self = this;
    var map = L.map('map', { zoomControl:false }).setView([self.userLocation.latitude, self.userLocation.longitude], 1);
    map.options.minZoom = 1;

    L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
    }).addTo(map);

    var userIcon = L.icon({
        iconUrl: self.userLocation.iconUrl,
        iconSize: [22, 39],
    });

    var userMarker = L.marker([self.userLocation.latitude, self.userLocation.longitude], {'icon': userIcon});

    userMarker.addTo(map);

    var userPopup = null;
    
    userMarker.on('mouseover', function (e) {
      userPopup = L.popup()
           .setLatLng([self.userLocation.latitude, self.userLocation.longitude])
           .setContent(self.userLocation.address ? self.userLocation.address : "NA")
            .openOn(map);
    });

    userMarker.on('mouseout', function (e) {
      if(userPopup) {
          map.closePopup(userPopup);
        }
    });

    for(let index = 0; index < this.locations.length; index++ ) {
      let object = this.locations[index];

      var markerIcon = L.icon({
        iconUrl: object.iconUrl,
        iconSize: [22, 39],
      });

      var marker = L.marker([object.lat, object.lng], {'icon': markerIcon});

      marker.addTo(map);
      var layerPopup = null;
      marker.on('mouseover', function (e) {
        var content = self.updateMarkerLabel(object);
        self.updateChartOnMarker(object, true);
        layerPopup = L.popup()
           .setLatLng([object.lat, object.lng])
           .setContent(content)
            .openOn(map);

      });
      marker.on('mouseout', function (e) {
        if(layerPopup) {
          self.updateChartOnMarker(object, false);
          map.closePopup(layerPopup);
        }
      });

      var polyline = L.polyline([[self.userLocation.latitude, self.userLocation.longitude], [object.lat, object.lng]], {color: object.color, weight: 1}).addTo(map);
      polyline.addTo(map);

      // L.Polyline.Arc([self.userLocation.latitude, self.userLocation.longitude], [object.lat, object.lng], {color: object.color,  weight: 1,
      // vertices: 50}).addTo(map);
    }
  }

  getBestlatencyregion() {
    if(!this.bestLatencyRegion && !this.disabledStart) {
      return this.properties.NA_TEXT;
    } else if(!this.bestLatencyRegion && this.disabledStart) {
      return this.properties.CALCULATING_TEXT;
    } else if(this.bestLatencyRegion && !this.disabledStart && this.bestLatencyRegion.latency != 0.0) {
      return this.bestLatencyRegion.region_name;
    } else {
      return this.properties.NA_TEXT;
    }
  }

  /**
   * generate AmMap
   * [generateAmMap description]
   */
  generateAmMap() {
    let self = this;

    var lines = [];
    var images = [];
    var planeSVG = "m2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47";


    if(self.userLocation.latitude && self.userLocation.longitude) {
      var userImg= {
            "id": "user",
            "imageURL": self.userLocation.iconUrl,
            "width": 22,
            "height": 22,
            "title": function() {
             return self.userLocation.address ? '<b>You are here</b><br>' + self.userLocation.address : "NA";
           },

            "latitude": self.userLocation.latitude,
            "longitude": self.userLocation.longitude,
            "scale": 1
      }

      images.push(userImg);
    }

    for(let index = 0; index < this.locations.length; index++) {
      let object = this.locations[index];

      if(self.userLocation.latitude && self.userLocation.longitude) {
      // Creating lines
        var line = {
            "id": "line" + index,
            "latitudes": [ self.userLocation.latitude, object.lat ],
            "longitudes": [ self.userLocation.longitude, object.lng ],
            "color": object.color,
            "arc": -0.85,
            "thickness" : 2
        };
        
        lines.push(line);
      }

      var regionImg= {
          "id": object.cloud_info.region,
          "imageURL": object.iconUrl,
          "width": 22,
          "height": 39,
          "title": function() {
            if(!self.hoveredObject || self.hoveredObject.id != object.cloud_info.region) {
              self.hoveredObject = object;
              self.hoveredObject.content = self.updateMarkerLabel(object);
            } 
            
            return self.hoveredObject.content;
          },
          "latitude": object.lat,
          "longitude": object.lng,
          "scale": 1
      }

      images.push(regionImg);

      // images.push({
      //   "imageURL": 'assets/E24725.svg',
      //   "positionOnLine": 0,
      //   "color": "#585869",
      //   "animateAlongLine": true,
      //   "lineId": "line" + index,
      //   // "flipDirection": true,
      //   "loop": true,
      //   "scale": 0.03,
      //   "positionScale": 1.8
      // });
    }

    

    var map = AmCharts.makeChart( "map", {
      "type": "map",
      "theme": "light",
      "dataProvider": {
        "map": "worldLow",
        "zoomLevel": 1.1,
        "lines": lines,
        "images": images
      },

      "areasSettings": {
        alpha: 0.5,
        unlistedAreasColor: '#BBBBBB'
      },

      "imagesSettings": {
        color: '#585869',
        rollOverColor: '#585869',
        selectedColor: '#585869',
        "adjustAnimationSpeed": false
      },

      "linesSettings": {
        "arc": -0.7, // this makes lines curved. Use value from -1 to 1
        // "arrow": "middle",
        // "arrowSize": 6,
        color: '#585869',
        thickness: 2,
        alpha: 0.7,
        balloonText: '',
        bringForwardOnHover: false,
      },

      "backgroundZoomsToTop": true,
      "linesAboveImages": true,
      
    } );
   
   map.balloon.textAlign = 'left';
 
   map.addListener("rollOverMapObject", function (event) {
     if(event && event.mapObject) {
       if(event.mapObject.objectType == "MapImage") {
         let region  = self.getRegionForImage(event.mapObject.id);
         if(region) {
           self.updateChartOnMarker(region, true);
         }
       }
     }
   });

   map.addListener("rollOutMapObject", function (event) {
       if(event && event.mapObject) {
         if(event.mapObject.objectType == "MapImage") {
           let region  = self.getRegionForImage(event.mapObject.id);
           if(region) {
             self.updateChartOnMarker(region, false);
           }
         }
       }
    });
  }

  /**
   * get the image for region
   * [getRegionForImage description]
   * @param {[type]} regionId [region name]
   */
  getRegionForImage(regionId) {
    for(let index = 0; index < this.locations.length; index++) {
      let location = this.locations[index];
      if(location.cloud_info.region === regionId) {
        return location;
      }
    }
    return null;
  }

}

// just an interface for type safety.
interface marker {
  lat: number;
  lng: number;
  label?: string;
  draggable: boolean;
}
