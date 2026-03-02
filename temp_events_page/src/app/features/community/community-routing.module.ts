// ========================================
// CampConnect — Community Routing Module
// ========================================

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostDetailsComponent } from './pages/post-details/post-details.component';

const routes: Routes = [
  {
    path: 'post/:id',
    component: PostDetailsComponent,
    data: {
      title: 'Post Details',
      breadcrumb: 'Post',
    },
  },

  // ── Future community routes ──
  // { path: 'profile/:id', component: ProfileComponent },
  // { path: 'feed', component: FeedComponent },
  // { path: '', redirectTo: 'feed', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommunityRoutingModule {}
