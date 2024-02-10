import express from "express";
import jwt from "jsonwebtoken";
import { Todo } from "../db/db-index";
import dotenv from "dotenv";
import { authenticatejwt } from "../middleware/auth";
const router = express.Router();

//TODO: add ability to pin todos
dotenv.config({ path: "./config/.env.local" });
const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error(
    "JWT_SECRET is not defined in the environment variables in user.ts."
  );
  process.exit(1);
}

interface CreatedTodo {
  title: string;
  description: string;
}
interface TodoInterface extends CreatedTodo {
  done: boolean;
  ownerId: string;
}

//create, update, delete, complete, show all
router.post("/create", authenticatejwt, (req, res) => {
  //TODO: add zod for todo body

  const { title, description }: CreatedTodo = req.body;
  const ownerId: string | undefined = req.headers.userId as string;
  if (typeof ownerId === "undefined") {
    res.status(403).json({ error: "Wrong data type of ownerId" });
  } else {
    const finalTodo: TodoInterface = {
      title,
      description,
      done: false,
      ownerId: ownerId || "001",
    };
  }
  const newTodo = new Todo({
    title,
    description,
    done: false,
    ownerId: req.headers.userId,
  });
  newTodo
    .save()
    .then((savedTodo) => {
      res.status(201).json({ message: "Todo created successfully" });
      console.log("Todo created: ", newTodo);
    })
    .catch((error) => {
      res.status(500).json({ message: error });
    });
});

router.get("/all", authenticatejwt, (req, res) => {
  Todo.find({ ownerId: req.headers.userId })
    //code expects todos to be of type <TodoInterface[]>, but mongoDB's .find returns a "document". solution: map(convert) everydocument to a Todointerfave
    //TODO: unable to do the above, need help
    // .then((documents: Array<Document & TodoInterface>) => {
    .then((todos) => {
      res.json({ todos });
    })
    .catch((error) => {
      console.log("unable to fetch todos: ", error);
      res.status(500).json({ error: error });
    });
});

router.patch("/update/:todoId/done", authenticatejwt, (req, res) => {
  const todoId = req.params.todoId;
  Todo.findOneAndUpdate(
    { _id: todoId, ownerId: req.headers.userId },
    { done: true },
    { new: true }
  )
    .then((updatedTodo) => {
      res.json({ message: "Todo completed" });
    })
    .catch((error) => {
      res.status(501).json({ error: "Unable to complete todo" });
    });
});

router.patch("/update/:todoId", authenticatejwt, (req, res) => {
  const todoId = req.params.todoId;
  const updatedData = req.body;
  Todo.findOneAndUpdate(
    { _id: todoId, ownerId: req.headers.userId },
    updatedData,
    { new: true }
  )
    .then((updatedTodo) => {
      console.log("updated todo is: ", updatedData);
      res.json({ message: "Todo updated" });
    })
    .catch((error) => {
      res.status(501).json({ error: "Unable to complete todo" });
    });
});

router.delete("/delete/:todoId", authenticatejwt, (req, res) => {
  const todoId = req.params.todoId;
  Todo.deleteOne({ _id: todoId, ownerId: req.headers.userId })
    .then((result) => {
      if (result.deletedCount === 1) {
        console.log("Successfully deleted one document.");
        res.json({ message: "deleted todo successfully" });
      } else {
        console.log("No documents matched the query. Deleted 0 documents.");
        res.sendStatus(204);
      }
    })
    .catch((error) => {
      console.log("encountered an error while deleting todo: ", error);
      res
        .status(500)
        .json({ message: "encountered an error while deleting todo" });
    });
});

export default router;
