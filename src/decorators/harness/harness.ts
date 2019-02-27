const harnessDetails = Symbol('harness-details');

export interface IHarnessDetails {
  name: string;
}

export function harness(details: IHarnessDetails): ClassDecorator | MethodDecorator {
  return (target: Object) => {
    target[harnessDetails] = details;
    return target;
  };
}

export function getHarnessDetails(target: Object | Function): IHarnessDetails {
  return target[harnessDetails];
}
