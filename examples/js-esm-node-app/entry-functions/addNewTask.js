export const addNewTaskTransaction = (
  task,
  moduleAddress
) => {
  return {
    data: {
      function: `${moduleAddress ? moduleAddress : process.env.MODULE_ADDRESS}::todolist::create_task`,
      functionArguments: [task],
    },
  };
};
