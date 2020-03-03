import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IHarness } from './models';
import { getRegisteredHarnesses } from './registerHarness';

// define globals
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyWindow = window as any;
anyWindow['React'] = React;
anyWindow['ReactDOM'] = ReactDOM;

declare const PACKAGE_NAME: string;
const packageName = PACKAGE_NAME;

function loadHarness(harness: IHarness) {
  document.location.href = `?harness=${harness.name}`;
}

function renderHarnessSelector(harness: IHarness, index: number) {
  return (
    <div className="harness-selector" key={index} onClick={() => loadHarness(harness)}>
      {harness.name}
    </div>
  );
}

window.onload = async () => {
  const harnesses = getRegisteredHarnesses();
  const params = new URLSearchParams(document.location.search);
  const harnessName = params.get('harness');
  const harness = harnesses.find(item => item.name === harnessName);
  let render: React.ReactElement | null = null;

  if (harness) {
    window.document.title = `${packageName} - ${harness.name} harness`;
    const HarnessComponent = harness.component;
    render = (
      <HarnessComponent />
    );
  } else {
    window.document.title = `${packageName} harness`;
    render = (
      <>
        <div className="harnesses">
          {harnesses.map(renderHarnessSelector)}
        </div>
      </>
    );
  }

  ReactDOM.render(render, document.querySelectorAll('page')[0]);

};
