import { useWallet } from "@aptos-labs/wallet-adapter-react";
// Internal Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "./components/ui/button";
import { useEffect, useState } from "react";
import { Checkbox } from "./components/ui/checkbox";
import { aptosClient } from "./utils/aptosClient";
import { addNewListTransaction } from "./entry-functions/addNewList";
import { addNewTaskTransaction } from "./entry-functions/addNewTask";
import { completeTaskTransaction } from "./entry-functions/completeTask";

type Task = {
  address: string;
  completed: boolean;
  content: string;
  task_id: string;
};

function App() {
  const { account, signAndSubmitTransaction } = useWallet();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [accountHasList, setAccountHasList] = useState<boolean>(false);

  const onWriteTask = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setNewTask(value);
  };

  const fetchList = async () => {
    if (!account) return [];
    try {
      const todoListResource = await aptosClient().getAccountResource({
        accountAddress: account?.address,
        resourceType: `${import.meta.env.VITE_MODULE_ADDRESS}::todolist::TodoList`,
      });
      setAccountHasList(true);
      // tasks table handle
      const tableHandle = (todoListResource as any).tasks.handle;
      // tasks table counter
      const taskCounter = (todoListResource as any).task_counter;

      let tasks = [];
      let counter = 1;
      while (counter <= taskCounter) {
        const tableItem = {
          key_type: "u64",
          value_type: `${import.meta.env.VITE_MODULE_ADDRESS}::todolist::Task`,
          key: `${counter}`,
        };
        const task = await aptosClient().getTableItem<Task>({ handle: tableHandle, data: tableItem });
        tasks.push(task);
        counter++;
      }
      // set tasks in local state
      setTasks(tasks);
    } catch (e: any) {
      console.log("error", e);
      setAccountHasList(false);
    }
  };

  const addNewList = async () => {
    if (!account) return [];

    const transaction = addNewListTransaction();
    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptosClient().waitForTransaction({ transactionHash: response.hash });
      setAccountHasList(true);
    } catch (error: any) {
      setAccountHasList(false);
    } finally {
    }
  };

  const onTaskAdded = async () => {
    // check for connected account
    if (!account) return;

    const transaction = addNewTaskTransaction(newTask);

    // hold the latest task.task_id from our local state
    const latestId = tasks.length > 0 ? parseInt(tasks[tasks.length - 1].task_id) + 1 : 1;

    // build a newTaskToPush objct into our local state
    const newTaskToPush = {
      address: account.address,
      completed: false,
      content: newTask,
      task_id: latestId + "",
    };

    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptosClient().waitForTransaction({ transactionHash: response.hash });

      // Create a new array based on current state:
      let newTasks = [...tasks];

      // Add item to the tasks array
      newTasks.push(newTaskToPush);
      // Set state
      setTasks(newTasks);
      // clear input text
      setNewTask("");
    } catch (error: any) {
      console.log("error", error);
    } finally {
    }
  };

  const onCheckboxChange = async (checked: string | boolean, taskId: string) => {
    if (!account) return;
    if (!checked) return;

    const transaction = completeTaskTransaction(taskId);

    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptosClient().waitForTransaction({ transactionHash: response.hash });

      setTasks((prevState) => {
        const newState = prevState.map((obj) => {
          // if task_id equals the checked taskId, update completed property
          if (obj.task_id === taskId) {
            return { ...obj, completed: true };
          }

          // otherwise return object as is
          return obj;
        });

        return newState;
      });
    } catch (error: any) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    fetchList();
  }, [account?.address]);

  return (
    <>
      <Header />

      <div className="flex items-center justify-center flex-col max-w-screen-xl mx-auto">
        {accountHasList ? (
          <Card className="flex flex-col gap-6 w-full">
            <CardContent>
              {/* Add a task component */}
              <div className="flex flex-col item-center space-y-4 mt-4 w-1/3">
                <Label htmlFor="add-a-task">Add a task</Label>
                <div className="flex flex-row gap-4">
                  <Input type="text" id="add-a-task" onChange={(event) => onWriteTask(event)} />
                  <Button onClick={onTaskAdded}>Add</Button>
                </div>
              </div>
              {/* All tasks component */}
              <div>
                {tasks &&
                  tasks.map((task) => {
                    return (
                      <div className="flex items-center space-x-2 mt-4" key={task.task_id}>
                        {task.completed ? (
                          <Checkbox defaultChecked={true} disabled />
                        ) : (
                          <Checkbox onCheckedChange={(checked) => onCheckboxChange(checked, task.task_id)} />
                        )}
                        <label
                          htmlFor="terms"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {task.content}
                        </label>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <CardHeader>
            <CardTitle>
              <Button onClick={addNewList}>Add new list</Button>
            </CardTitle>
          </CardHeader>
        )}
      </div>
    </>
  );
}

export default App;
