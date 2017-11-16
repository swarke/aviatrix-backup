import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ModalComponent } from './modal/modal.component';
import { AWSComponent } from './aws/aws.component';
import { AzureComponent } from './azure/azure.component';
import { GCEComponent } from './gce/gce.component';

const AppRoutes: Routes = [
	{ path: 'aws/speedtest', component: AWSComponent },
	{ path: 'azure/speedtest', component: AzureComponent},
	{ path: 'gce/speedtest', component: GCEComponent },
];
export const appRoutingProviders: any[] = [];
export const AppRoutingModule = RouterModule.forRoot(AppRoutes, { useHash: true });
