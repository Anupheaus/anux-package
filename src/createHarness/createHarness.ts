import { FunctionComponent } from 'react';
import { IHarnessDetails } from './models';
import { harnessDetailsSymbol } from './harnessDetailsSymbol';

export function createHarness<TComponent extends FunctionComponent>(details: IHarnessDetails, component: TComponent): TComponent {
  component[harnessDetailsSymbol] = details;
  return component;
}
