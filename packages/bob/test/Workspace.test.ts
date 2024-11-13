import {
  afterEach,
  describe,
  it,
  vi,
} from 'vitest';

import { Workspace } from '../src/Workspace';

// vi.mock('fs');

describe('Workspace', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it.todo(
    'Should find nearest NPM workspace when PNPM workspace is not found',
  );

  // it('Should find nearest NPM workspace when PNPM workspace is not found', async () => {
  //   vi.mocked(findConfig).mockImplementation((startPlace, options) => {
  //     return
  //   });

  //   const foundWorkspace = await Workspace.loadNearest(process.cwd());

  //   expect(foundWorkspace).to.be.instanceOf(Workspace);

  //   // TODO: check that its npm workspace in some way
  // });

  // TODO
  // it('Should throw if not found', async () => {
  //   vi.mocked(lilconfig).mockImplementation((name, options) => {
  //     return {
  //       load: () => Promise.resolve({ config: '', filepath: '' }),
  //       search() {
  //         if (options?.searchPlaces?.[0] === PACKAGE_JSON) {
  //           return Promise.resolve({ config: null, filepath: path.join(process.cwd(), 'package.json') });
  //         }

  //         return Promise.resolve(null);
  //       },
  //     };
  //   });

  //   await expect(async () => await Workspace.getNearest(process.cwd())).to.throw(Error);
  // });

  // TODO
  // it('Should find nearest PNPM workspace when it exists', async () => {
  //   console.log(await Workspace.getNearest(process.cwd()).then((res) => res.getPackages()));
  // });
});
