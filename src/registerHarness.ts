import { FunctionComponent } from 'react';
import { IHarnessDetails, IHarness, HarnessRegistry } from './models';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyWindow = window as any;

function addToRegistry(harness: IHarness): void {
  const harnessRegistry = anyWindow[HarnessRegistry] = anyWindow[HarnessRegistry] || [];
  harnessRegistry.push(harness);
}

export function getRegisteredHarnesses(): IHarness[] { return anyWindow[HarnessRegistry].slice(); }

export function registerHarness<TComponent extends FunctionComponent>(details: IHarnessDetails, component: TComponent): void {
  addToRegistry({
    ...details,
    component,
  });
}
