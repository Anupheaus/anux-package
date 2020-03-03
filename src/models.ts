import { FunctionComponent } from 'react';

export const HarnessRegistry = 'harness-registry';

export interface IHarnessDetails {
  name: string;
}

export interface IHarness extends IHarnessDetails {
  component: FunctionComponent;
}
