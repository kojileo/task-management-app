// jest-dom adds custom jest matchers for asserting on DOM nodes.
// It allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
import '@testing-library/jest-dom';

// モックによるコンソールエラーの抑制
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      /Warning: ReactDOM.render is no longer supported in React 18/.test(args[0]) ||
      /Warning: The current testing environment is not configured to support act/.test(args[0]) ||
      /Error: Uncaught/.test(args[0])
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
}); 