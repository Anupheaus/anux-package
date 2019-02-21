export * from './dist/index';
import { expect as chaiExpect } from 'chai';

declare global {
  export const expect: typeof chaiExpect;
    export namespace React { }
    export namespace ReactDOM { }
}
