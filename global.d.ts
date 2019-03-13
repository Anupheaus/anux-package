import { expect as chaiExpect } from 'chai';
export * from './dist/index';

declare global {
  export const expect: typeof chaiExpect;
  export namespace React { }
  export namespace ReactDOM { }
}
