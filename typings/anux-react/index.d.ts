/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/ban-ts-ignore */
// @ts-ignore
import * as ReactGlobal from 'react';
// @ts-ignore
import * as ReactDOMGlobal from 'react-dom';

declare global {
  export const React: typeof ReactGlobal;
  export const ReactDOM: typeof ReactDOMGlobal;
}