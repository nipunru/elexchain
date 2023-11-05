// jest.setup.js
import "@testing-library/jest-dom";
// Mocking the localStorage API
const localStorageMock = (function () {
  let store = {};
  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = value.toString();
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Clear all mocks between tests
afterEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});
