export const addNewListTransaction = (
  moduleAddress
) => {
  return {
    data: {
      function: `${moduleAddress ? moduleAddress : process.env.MODULE_ADDRESS}::todolist::create_list`,
      functionArguments: [],
    },
  };
};
