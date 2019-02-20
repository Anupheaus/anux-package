const harnessDetails = Symbol('harness-details');

export interface IHarnessDetails {
  name: string;
}

export function harness(details: IHarnessDetails): ClassDecorator {
  return target => {
    target[harnessDetails] = details;
    return target;
  };
}

export function getHarnessDetails(target: Function): IHarnessDetails {
  return target[harnessDetails];
}
