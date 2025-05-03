import * as React from 'react';

// react-hot-toastのモック
jest.mock('react-hot-toast', () => ({
  Toaster: function MockToaster() {
    return React.createElement('div', {
      className: 'toaster',
      'data-testid': 'toaster',
    });
  },
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Next.js navigationのモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: jest.fn().mockReturnValue({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    forEach: jest.fn(),
    entries: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    toString: jest.fn(),
  }),
  usePathname: jest.fn().mockReturnValue('/'),
  useParams: jest.fn().mockReturnValue({}),
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// ResizeObserverのモック
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
