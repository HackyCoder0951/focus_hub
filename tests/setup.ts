import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement ResizeObserver; several Radix UI primitives
// (RadioGroup, Checkbox, Slider, ...) read element size via it on mount.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
