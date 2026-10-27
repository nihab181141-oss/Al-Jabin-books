import { Book, Coupon } from '../types';

export const INITIAL_BOOKS: Book[] = [];

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'BENGALREADS',
    discountPercentage: 15,
    minSpend: 500,
    description: '15% off on orders above ৳500 for community readers',
    isActive: true
  },
  {
    code: 'GROWTH20',
    discountPercentage: 20,
    minSpend: 800,
    description: '20% off on ebook bundles above ৳800',
    isActive: true
  },
  {
    code: 'ALJABIN10',
    discountPercentage: 10,
    minSpend: 300,
    description: '10% welcome discount for new readers',
    isActive: true
  }
];
