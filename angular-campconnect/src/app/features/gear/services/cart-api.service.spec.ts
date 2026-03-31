import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CartApiService } from './cart-api.service';

describe('CartApiService', () => {
  let service: CartApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CartApiService]
    });

    service = TestBed.inject(CartApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch cart', () => {
    service.getCart().subscribe((res) => {
      expect(res.id).toBe('cart-1');
    });

    const req = httpMock.expectOne('http://localhost:8081/api/cart');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'cart-1', userId: 'u1', items: [], subtotal: 0, totalDeposit: 0, grandTotal: 0 });
  });

  it('should remove item from cart', () => {
    service.removeFromCart('item-1').subscribe();

    const req = httpMock.expectOne('http://localhost:8081/api/cart/items/item-1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ id: 'cart-1', userId: 'u1', items: [], subtotal: 0, totalDeposit: 0, grandTotal: 0 });
  });

  it('should checkout cart with POST', () => {
    service.checkoutCart().subscribe();

    const req = httpMock.expectOne('http://localhost:8081/api/cart/checkout');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush(null);
  });
});
