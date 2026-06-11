import { Routes } from '@angular/router';
import { BackendStatusComponent } from './backend-status-component/backend-status-component';
import { TripPlannerDisplayerComponent } from './trip-planner-displayer-component/trip-planner-displayer-component';
import { TripPlannerFormComponent } from './trip-planner-form-component/trip-planner-form-component';
import { UserDashboardComponent } from './user-dashboard-component/user-dashboard-component';
import { HomeComponent } from './home-component/home-component';

export const routes: Routes = [
    {
        path: 'backend-status',
        component: BackendStatusComponent
    },
    {
        path: 'trip-planner-displayer',
        component: TripPlannerDisplayerComponent
    },
    {
        path: 'plan-trip',
        component: TripPlannerFormComponent
    },
    {
        path: 'user-profile',
        component: UserDashboardComponent
    },
    {
        path: '',
        component: HomeComponent
    }
];
