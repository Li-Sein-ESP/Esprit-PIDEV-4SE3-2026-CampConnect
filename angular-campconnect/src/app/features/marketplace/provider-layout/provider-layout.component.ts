import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProviderSidebarComponent } from '../provider-sidebar/provider-sidebar.component';
import { ProviderHeaderComponent } from '../provider-header/provider-header.component';

@Component({
    selector: 'app-provider-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, ProviderSidebarComponent, ProviderHeaderComponent],
    templateUrl: './provider-layout.component.html',
    styleUrls: ['./provider-layout.component.scss']
})
export class ProviderLayoutComponent { }
