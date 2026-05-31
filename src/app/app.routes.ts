import { Routes } from '@angular/router';
import { LoginComponent } from './screens/login/login';
import { MatchesComponent } from './screens/matches/matches';
import { GroupsComponent } from './screens/groups/groups';
import { RankingComponent } from './screens/ranking/ranking';
import { ProfileComponent } from './screens/profile/profile';
import { HomeComponent } from './screens/home/home';
import { ExtrasComponent } from './screens/extras/extras';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'matches', component: MatchesComponent, canActivate: [authGuard] },
    { path: 'groups', component: GroupsComponent, canActivate: [authGuard] },
    { path: 'ranking', component: RankingComponent },
    { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
    { path: 'extras', component: ExtrasComponent, canActivate: [authGuard] },
];
