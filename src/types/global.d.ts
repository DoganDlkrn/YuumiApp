/// <reference types="node" />

declare namespace NodeJS {
  interface Global {
    require: NodeRequire;
  }
}

// Enable JSX
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
} 