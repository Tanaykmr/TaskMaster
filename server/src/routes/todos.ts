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


//create, update, delete, complete, show all
router.post("/create", authenticatejwt, (req, res) => {
  //TODO: add zod for todo body
  const { title, description } = req.body;
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
    .then((todos) => {
      res.json(todos);
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
