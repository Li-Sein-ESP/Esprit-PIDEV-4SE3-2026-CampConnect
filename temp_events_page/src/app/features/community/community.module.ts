// ========================================
// CampConnect — Community Feature Module
// ========================================

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CommunityRoutingModule } from './community-routing.module';
import { PostDetailsComponent } from './pages/post-details/post-details.component';

@NgModule({
  declarations: [
    PostDetailsComponent,

    // ── Future community components ──
    // ProfileComponent,
    // FeedComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    CommunityRoutingModule,
  ],
})
export class CommunityModule {}
