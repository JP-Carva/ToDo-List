import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { PrimeNG } from 'primeng/config';
import { LoadingService } from '../services/loading.services';
import { ptBrLocation } from '../pt-br.primeng';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, CommonModule, ToastModule, ProgressSpinnerModule],
    providers: [MessageService],
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
    primengConfig = inject(PrimeNG);
    loadingService = inject(LoadingService);

    ngOnInit(): void {
        this.primengConfig.setTranslation(ptBrLocation);
    }

    loading = this.loadingService.loading;

}
