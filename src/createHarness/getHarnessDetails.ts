import { harnessDetailsSymbol } from './harnessDetailsSymbol';
import { FunctionComponent } from 'react';
import { IHarnessDetails } from './models';

export function getHarnessDetails(component: FunctionComponent): IHarnessDetails {
  return component && component[harnessDetailsSymbol];
}
