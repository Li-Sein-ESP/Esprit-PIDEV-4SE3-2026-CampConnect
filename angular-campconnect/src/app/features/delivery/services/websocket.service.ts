import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import { environment } from '../../../../environments/environment';
import { DeliveryResponse } from './delivery-api.service';

import * as SockJSClient from 'sockjs-client';

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {

    private client: Client | null = null;
    private deliveryUpdates$ = new Subject<DeliveryResponse>();
    private connected = false;

    constructor(private zone: NgZone) {}

    /** Observable that emits every delivery status update pushed from the backend */
    get deliveryUpdates(): Observable<DeliveryResponse> {
        return this.deliveryUpdates$.asObservable();
    }

    connect(): void {
        if (this.connected || this.client) return;

        const wsUrl = environment.apiUrl.replace('/api', '') + '/ws';
        const SockJSConstructor = (SockJSClient as any).default || SockJSClient;

        this.client = new Client({
            webSocketFactory: () => new SockJSConstructor(wsUrl),
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            debug: (msg) => {
                if (!environment.production) {
                    console.debug('[STOMP]', msg);
                }
            },
            onConnect: () => {
                // Run inside Angular's zone so that connected=true triggers CD
                this.zone.run(() => {
                    this.connected = true;
                    console.log('[WebSocket] Connected');
                });

                this.client!.subscribe('/topic/delivery-updates', (message: IMessage) => {
                    try {
                        const delivery: DeliveryResponse = JSON.parse(message.body);
                        // Emit inside zone so component templates update immediately
                        this.zone.run(() => this.deliveryUpdates$.next(delivery));
                    } catch (e) {
                        console.error('[WebSocket] Failed to parse delivery update:', e);
                    }
                });
            },
            onDisconnect: () => {
                this.zone.run(() => {
                    this.connected = false;
                    console.log('[WebSocket] Disconnected');
                });
            },
            onStompError: (frame) => {
                console.error('[WebSocket] STOMP error:', frame.headers['message'], frame.body);
            }
        });

        this.client.activate();
    }

    disconnect(): void {
        if (this.client) {
            this.client.deactivate();
            this.client = null;
            this.connected = false;
        }
    }

    isConnected(): boolean {
        return this.connected;
    }

    private providerAlerts$ = new Subject<any>();

    /** Observable for unassigned delivery alerts scoped to a provider */
    get providerAlerts(): Observable<any> {
        return this.providerAlerts$.asObservable();
    }

    /** Subscribe to /topic/provider-alerts/{providerId} when connected */
    subscribeToProviderAlerts(providerId: string): void {
        if (!this.client || !this.connected) {
            // Retry once connected
            const interval = setInterval(() => {
                if (this.connected && this.client) {
                    clearInterval(interval);
                    this._doSubscribeProvider(providerId);
                }
            }, 1000);
            return;
        }
        this._doSubscribeProvider(providerId);
    }

    private _doSubscribeProvider(providerId: string): void {
        this.client!.subscribe(`/topic/provider-alerts/${providerId}`, (msg: IMessage) => {
            try {
                this.zone.run(() => this.providerAlerts$.next(JSON.parse(msg.body)));
            } catch (e) {
                console.error('[WebSocket] Failed to parse provider alert:', e);
            }
        });
    }

    ngOnDestroy(): void {
        this.disconnect();
        this.deliveryUpdates$.complete();
        this.providerAlerts$.complete();
    }
}
