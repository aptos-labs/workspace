## Aptos Workspace

Aptos Workspace is an integrated development environment designed to make innovation on Aptos easy and intuitive by removing unnecessary obstacles and lowering the barrier to entry.

> **_NOTE:_** This is an alpha, non-production-ready version. Breaking changes are expected.

## Overview

Aptos Workspace provides a testing environment framework for Aptos developers to easily run integration tests for their dApps.

Aptos Workspace utilizes [mocha](https://mochajs.org/) as the testing framework and [chai](https://www.chaijs.com/) as the assertion framework.

## Getting Started

To start using Workspace you need to create an `npm project` by going to an empty folder (or `cd` into an existing one), and run:

```bash
npm init --y
```

## Installation

Once you created a npm project, you should install Workspace:

```bash
npm install --save-dev @aptos-labs/workspace
```

> **_NOTE:_** Using `pnpm` or `yarn`? You'll need to do some manual work, follow the instructions [here](#using-yarn)

## Quick Start

To get started with Aptos Workspace, open your terminal, cd into your dapp directory, and run the following command:

```bash
npx aptos-workspace init
```

The prompt will ask you to choose the language you want to use - `TypeScript` or `JavaScript`.

Then, Workspace will initialize your testing environment by:

1. Creating a `workspace.config` file to be used in your project.
2. Creating a `tests` folder with a `my-first-test` example file (this step will be skipped if the folder already exists).
3. For TypeScript projects, creating a `tsconfig.testing.json` file to be used within Workspace (this step will be skipped if the file already exists).

## Write tests

By default, Workspace will look for a `contract` folder in the root of your project containing your project's Move contracts. Make sure your Move contracts are in this folder or [configure Workspace to use a different folder](#workspace-config).

If you have initialized Workspace for the first time, feel free to check out the generated test file `my-first-test`.

Here's a general overview of how you will write a test:

1. Define a `describe` block for your test suite.
2. Import `expect` from `chai` to write your assertions.
3. Write your tests inside the `describe` block.

```javascript
import { expect } from "chai";

describe("my first test", () => {
  it("tests something", async () => {
    expect(1 + 1).toEqual(2);
  });
});
```

## Workspace API

Workspace provides a set of API variables and functions to interact with the Workspace framework.

### `workspace` object

A workspace object to access the current client thread.

```typescript
import { workspace } from "@aptos-labs/workspace";

await workspace.getAccountModules({
  accountAddress: objectAddress,
});
```

### `getTestSigners()`

A function to generate a set of Aptos Ed25519Account test signers.

```typescript
import { getTestSigners } from "@aptos-labs/workspace";

const [signer1] = await getTestSigners();
const [signer1, signer2, signer3] = await getTestSigners(3);
```

### `publishMovePackage()`

A function to publish a Move package to the Workspace test node. Make sure you use the correct `namedAddresses` and the `addressName` for your contracts.

```typescript
import { publishMovePackage, getTestSigners } from "@aptos-labs/workspace";

const [signer1] = await getTestSigners();
const { packageObjectAddress } = await publishMovePackage({
  publisher: signer1,
  namedAddresses: {
    module_addr: signer1.accountAddress,
  },
  addressName: "module_addr",
});
```

If your Move package is under a sub folder (e.g. `contract/MessageBoard` - for cases you have multiple move packages in your project), you can specify the `packageFolderName` option.

```typescript
import { publishMovePackage, getTestSigners } from "@aptos-labs/workspace";

const [signer1] = await getTestSigners();
const { packageObjectAddress } = await publishMovePackage({
  publisher: signer1,
  namedAddresses: {
    module_addr: signer1.accountAddress,
  },
  addressName: "module_addr",
  packageFolderName: "MessageBoard",
});
```

### `publishCompiledMoveScript()`

A function to publish a compiled Move script to the Workspace test node.

```typescript
import {
  publishCompiledMoveScript,
  getTestSigners,
} from "@aptos-labs/workspace";

const [signer1] = await getTestSigners();
const { scriptOutput } = await publishCompiledMoveScript({
  publisher: signer1,
  compiledScriptPath: "path/to/compiled/script.mv",
});
```

## Run tests

To run your tests with Aptos Workspace, open your terminal, cd into your dapp directory, and run the following command:

```bash
npx aptos-workspace test
```

We recommend to add a `npm script` to your `package.json` to make it easier to run your tests.

```json
"scripts": {
  "test": "npx aptos-workspace test"
}
```

Then you can simply run `npm test` to run your tests.

This command will run ALL the tests in the `tests` folder, to specify a single test file, you can run:

```bash
npx aptos-workspace test --grep <test-name> // e.g. npx aptos-workspace test --grep my first test
```

## `workspace.config` file

The `workspace.config` file is used to configure the Workspace framework.

### `contractDir`

The `contractDir` option is used to specify the directory containing your project's Move contracts.

By default, this option is set to `contract`, if your contracts are located in a different directory, you can specify it in the `workspace.config` file.

```typescript
const config: WorkspaceUserConfig = {
  contractDir: "contract",
};
```

### `verbose`

The `verbose` option is used to specify the verbosity of the Workspace framework.

By default, this option is set to `false`, if you want to see the verbose output, you can set it to `true` in the `workspace.config` file.

```typescript
const config: WorkspaceUserConfig = {
  verbose: true,
};
```

## `Surf` support

Workspace supports the [Thala's Surf](https://aptos.dev/en/build/sdks/ts-sdk/type-safe-contract) TypeScript type safety library.

To use Surf with Workspace, you need to install the `@thalalabs/surf` package.

```bash
npm install --save-dev @thalalabs/surf
```

Surf uses the contract ABI to infer the types of the contract's functions and events.
To generate your contract ABI, you can use the `npx aptos-workspace gen-abi` command.

```bash
npx aptos-workspace gen-abi
```

This function will generate the ABI for your contracts and save it in the `abis` directory.
Then, you can use the `surfClient` in your tests.

Check out the [Surf example](../examples/ts-node-app/tests/todoList-with-surf.ts) for more details.

## Move unit tests

Workspace also supports running Move unit tests.

To run your Move unit tests, you can use the `npx aptos-workspace move-unit-tes` command.

```bash
npx aptos-workspace move-unit-test
```

### Using `pnpm` or `yarn`?

#### Using yarn?

If your project uses `yarn`, and you dont have the `@aptos-labs/ts-sdk` installed, you'll need to manually install it.

```
yarn add --dev @aptos-labs/ts-sdk
```

#### Using pnpm?

If your project uses `pnpm`, and you dont have the `@aptos-labs/aptos-cli` installed, you'll need to manually install it.

```
pnpm add -D @aptos-labs/aptos-cli
```
