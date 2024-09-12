
export const completeTaskTransaction = (
  taskId,
  moduleAddress
) => {
  return {
    data: {
      function: `${moduleAddress ? moduleAddress : process.env.MODULE_ADDRESS}::todolist::complete_task`,
      functionArguments: [taskId],
    },
  };
};
