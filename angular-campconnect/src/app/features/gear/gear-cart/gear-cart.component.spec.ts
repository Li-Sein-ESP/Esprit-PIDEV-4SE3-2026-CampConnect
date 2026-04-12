import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { GearCartComponent } from './gear-cart.component';
import { CartApiService } from '../services/cart-api.service';

describe('GearCartComponent', () => {
  let component: GearCartComponent;
  let fixture: ComponentFixture<GearCartComponent>;
  let cartApi: jasmine.SpyObj<CartApiService>;

  const mockCart = {
    id: 'cart-1',
    userId: 'user-1',
    items: [{
      id: 'item-1',
      gearId: 'gear-1',
      itemType: 'RENT',
      gearName: 'Tent',
      gearImage: 'https://img.com/1.jpg',
      gearCondition: 'Good',
      gearCategory: 'Tents',
      quantity: 1,
      rentalDays: 2,
      unitPrice: 10,
      deposit: 0,
      lineTotal: 10
    }],
    subtotal: 10,
    totalDeposit: 0,
    grandTotal: 10
  } as any;

  beforeEach(async () => {
    cartApi = jasmine.createSpyObj('CartApiService', ['getCart', 'removeFromCart', 'checkoutCart']);
    cartApi.getCart.and.returnValue(of(mockCart));
    cartApi.removeFromCart.and.returnValue(of({ ...mockCart, items: [] }));
    cartApi.checkoutCart.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [GearCartComponent],
      providers: [
        provideRouter([]),
        { provide: CartApiService, useValue: cartApi }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GearCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load cart', () => {
    expect(component).toBeTruthy();
    expect(component.cart?.id).toBe('cart-1');
    expect(component.loading).toBeFalse();
  });

  it('should remove item and update cart', () => {
    component.removeItem('item-1');

    expect(cartApi.removeFromCart).toHaveBeenCalledWith('item-1');
    expect(component.cart?.items.length).toBe(0);
  });

  it('should set error when loadCart fails', () => {
    cartApi.getCart.and.returnValue(throwError(() => new Error('fail')));

    component.loadCart();

    expect(component.error).toContain('Failed to load your cart');
    expect(component.loading).toBeFalse();
  });

  it('should map item type labels', () => {
    expect(component.getItemTypeLabel('RENT')).toBe('Rental');
    expect(component.getItemTypeLabel('BUY')).toBe('Purchase');
  });
});
