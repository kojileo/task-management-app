// jest-dom adds custom jest matchers for asserting on DOM nodes.
// It allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
import '@testing-library/jest-dom';
import './src/tests/setup-mocks';

// モックによるコンソールエラーの抑制
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      /Warning: ReactDOM.render is no longer supported in React 18/.test(args[0]) ||
      /Warning: The current testing environment is not configured to support act/.test(args[0]) ||
      /Error: Uncaught/.test(args[0]) ||
      /DndContext|SortableContext/.test(args[0])
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Next.js navigationのモック
jest.mock('next/navigation', () => require('../src/tests/__mocks__/next_navigation'));

// DnD-kitのモック
jest.mock('@dnd-kit/core', () => require('../src/tests/__mocks__/@dnd-kit_core'));
jest.mock('@dnd-kit/sortable', () => require('../src/tests/__mocks__/@dnd-kit_sortable'));
jest.mock('@dnd-kit/utilities', () => require('../src/tests/__mocks__/@dnd-kit_utilities'));

// テスト用のReferenceErrorを抑制
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
})); 