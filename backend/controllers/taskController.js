import Task from "../models/Task.js";

// Create Task
export const createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      priority: req.body.priority || "Low",
      user: req.user._id,
    });

    res.status(201).json(task);
  } catch (err) {
    console.error("Create Task Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Tasks
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(tasks);
  } catch (err) {
    console.error("Get Tasks Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Task
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        ...req.body,
        priority: req.body.priority || "Low",
      },
      { new: true }
    );

    res.status(200).json(task);
  } catch (err) {
    console.error("Update Task Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Task
export const deleteTask = async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    res.status(200).json({ message: "Task deleted" });
  } catch (err) {
    console.error("Delete Task Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
