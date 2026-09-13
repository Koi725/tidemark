import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// jsdom has no canvas; axe's colour-contrast probe calls getContext(). Stub it so
// the "Not implemented: HTMLCanvasElement.getContext" noise stays out of test output.
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = (() =>
    null) as typeof HTMLCanvasElement.prototype.getContext
}

// jsdom does not implement matchMedia; several primitives and the reduced-motion
// helper depend on it. Provide a minimal, no-op stub defaulting to "no match".
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
}

afterEach(() => {
  cleanup()
})
