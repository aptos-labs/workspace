# First Aptos Workspace Project

This is a tutorial that walks you through the steps to create a TS/JS project using Aptos Workspace. By the end, you’ll have a functional development setup with a sample Move contract and integration test.

# Step 0: Install Dependencies

Before getting started, please make sure you have the necessary dependencies installed.

Follow the [this section of the Aptos Workspace README](./README.md#Dependencies) to install the required Dependencies:
- Node.js and npm
- git
- Docker
- Microsoft VC++ Redistributable (windows only)

# Step 1: Initialize the npm Project

To set up your project, run the following command in your terminal:

```bash
npm init -y
```

This initializes an npm package and generates a `package.json` file.

Here’s an example of what it looks like:

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

# Step 2: Install Aptos Workspace

Now, install **Aptos Workspace** as a development dependency:

```bash
npm install --save-dev @aptos-labs/workspace
```

This adds the following entry to `package.json`:

```json
  "devDependencies": {
    "@aptos-labs/workspace": "^0.0.24"
  }
```

# Step 3: Initialize Aptos Workspace

Next, initialize Aptos Workspace by running:

```bash
npx aptos-workspace init
```

You'll be prompted to choose between **JavaScript** and **TypeScript**.

In this tutorial, we’ll continue with **TypeScript.**

This command generates the following project structure:

```
- my-project
  - contract                // Directory containing all Move packages
    - hello_blockchain      // A sample Move package, implementing a hello_blockchain contract
      - sources
        - message.move
      - Move.toml
  - tests                   // Directory for integration tests
    - my-first-test.ts      // An integration test using `hello_blockchain`
  - tsconfig.testing.json   // Config file for the test runner (we currently use Mocha)
  - workspace.config.ts     // Config file for aptos workspace
```

As shown above, the generated files include a sample **Move contract** and an **integration test** that runs out of the box.

# Step 4: Run integration tests

To verify that everything is set up correctly, run the integration tests:

```bash
npx aptos-workspace test
```

If everything is configured properly, you should see output similar to this:

```
Aptos CLI version 6.0.2 detected.
Docker version 27.5.1 detected.

Spinning up local networks to run tests, this may take a while...

  my first test
    ✔ publish the contract (5866ms)
    ✔ set message (134ms)
    ✔ get message

  3 passing (24s)
```

# You are all set! 🎉

Congratulations! You’ve just finished setting up your first **Aptos Workspace** project!

Now, let's explore the generated Move contract and integration test to understand how they work.

## Exploring the `hello_blockchain` contract

```rust
module hello_blockchain::message {
    use std::error;
    use std::signer;
    use std::string;

    struct MessageHolder has key {
        message: string::String,
    }

    const ENO_MESSAGE: u64 = 0;

    #[view]
    public fun get_message(addr: address): string::String acquires MessageHolder {
        assert!(exists<MessageHolder>(addr), error::not_found(ENO_MESSAGE));
        borrow_global<MessageHolder>(addr).message
    }

    public entry fun set_message(account: signer, message: string::String)
    acquires MessageHolder {
        let account_addr = signer::address_of(&account);
        if (!exists<MessageHolder>(account_addr)) {
            move_to(&account, MessageHolder {
                message,
            })
        } else {
            let old_message_holder = borrow_global_mut<MessageHolder>(account_addr);
            old_message_holder.message = message;
        }
    }
}
```

This **Move module** allows an user to:

- **Store a message on-chain** using `set_message`
- **Retrieve a stored message** using `get_message`

## Exploring the Sample Integration Test

The generated integration test (`tests/my-first-test.ts`) demonstrates how you can write a complete test workflow.

**Notable features**

- Uses [mocha](https://mochajs.org/#getting-started) as the test framework, which should be familiar to most TS/JS developers.
- Provides a **fully functional Aptos client** via the global variable **`workspace`**, allowing interactions with the test network.
    - Supports all features available in the [Aptos TypeScript SDK](https://aptos-labs.github.io/aptos-ts-sdk/@aptos-labs/ts-sdk-1.33.2/classes/Aptos.html).

# Next Steps 🚀

Now that you have a working setup, you can:

- ✅ Modify the **Move contract** to implement additional functionality.
- ✅ Extend the **integration tests** to validate more complex workflows.
- ✅ Experiment with different **Aptos SDK features**.

For further exploration, check out the [Aptos Documentation](https://aptos.dev/) and [Aptos Workspace GitHub Repo](https://github.com/aptos-labs/workspace).

Happy coding! 🎉🚀