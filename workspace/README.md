## Aptos Workspace

Aptos Workspace is an integrated development environment designed to make innovation on Aptos easy and intuitive by removing unnecessary obstacles and lowering the barrier to entry.

> **_NOTE:_** This is an alpha, non-production-ready version. Breaking changes are expected.

## Overview

Currently, Aptos Workspace serves as a testing environment that provides a framework for Aptos developers to easily run integration tests for their dApps.

Aptos Workspace utilizes [mocha](https://mochajs.org/) as the testing framework and [chai](https://www.chaijs.com/) as the assertion framework.

## Installation

```bash
npm install --save-dev @aptos-labs/workspace
```

Aptos Workspace supports only `.ts` test files and uses `TypeScript` and `ts-node` under the hood, so make sure you installed the relevant packages.

```bash
npm install --save-dev ts-node typescript
```

To be able to write your tests in TypeScript, you also need these packages:

```bash
npm install --save-dev chai@4 @types/chai@4 @types/mocha tree-kill
```

### Using pnpm or yarn?

If your project uses `pnpm` or `yarn`, you'll also need this package due to the specific behavior of these package managers. Read more about it [here](https://github.com/aptos-labs/workspace/pull/6)

```
pnpm install --save-dev @aptos-labs/aptos-cli
```

## Quick Start

To get started with Aptos Workspace, open your terminal, cd into your dapp directory, and run the following command:

```bash
npx aptos-workspace init
```

The command will initialize your testing environment by:

1. Creating a `tests` folder with a `my-first-test.ts` example file (this step will be skipped if the folder already exists).
2. Creating a `tsconfig.testing.json` file to be used within Workspace (this step will be skipped if the file already exists).

## Write tests

If you have initialized Workspace for the first time, feel free to check out the generated test file `my-first-test.ts`. Here's a general overview of how you will write a test:

1. Initialize an `Aptos` client instance configured to use the LOCAL network

```ts
import { AptosConfig, Network, Aptos } from "@aptos-labs/ts-sdk";

const aptosConfig = new AptosConfig({ network: Network.LOCAL });
const aptos = new Aptos(aptosConfig);
```

2. Define a `describe` block for your test suite.

If you need to publish a Move package to run your test, you can add a `before` hook to generate a testing account and publish the Move package to the Aptos network.

> **_NOTE:_** Workspace looks for a `move` directory in the root folder that contains the Move modules. Make sure this directory exists

```ts
import { generateTestAccount, publishPackage } from "@aptos-labs/workspace";
import {
  AptosConfig,
  Network,
  Aptos,
  Ed25519Account,
} from "@aptos-labs/ts-sdk";

let signer1: Ed25519Account;

describe("my first test", () => {
  // Optional `before` block to publish a Move package before running tests
  before(function (done) {
    (async () => {
      signer1 = await generateTestAccount();
      await publishPackage({
        publisher: signer1,
        namedAddresses: {
          module_addr: signer1.accountAddress.toString(),
        },
      });
    })().then(done);
  });
});
```

3. Write your test. In the `it` block, fetch the `publisher` account's modules and use `expect` to verify that at least one module is published to the Aptos network.

```ts
import { expect } from "chai";

it("it publishes the contract under the correct address", async () => {
  const accountModules = await aptos.getAccountModules({
    accountAddress: signer1.accountAddress,
  });
  expect(accountModule).to.have.length.at.least(1);
});
```

## Run tests

To run your tests with Aptos Workspace, open your terminal, cd into your dapp directory, and run the following command:

```bash
npx aptos-workspace test
```
