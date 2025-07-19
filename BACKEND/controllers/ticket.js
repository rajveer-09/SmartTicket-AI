import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.model.js";
import User from "../models/user.model.js";


// Create Ticket
export const createTicket = async (req, res) => {
  try {
    const { title, description, priority, deadline, relatedSkills, assignedTo } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const newTicket = await Ticket.create({
      title,
      description,
      priority: priority || "low",
      deadline,
      relatedSkills: relatedSkills || [],
      assignedTo: assignedTo || null,
      createdBy: req.user._id.toString(),
    });

    await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: newTicket._id.toString(),
        title: newTicket.title,
        description: newTicket.description,
        createdBy: req.user._id.toString(),
      },
    });

    return res.status(201).json({
      message: "Ticket created successfully",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Error creating ticket:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Tickets
export const getTickets = async (req, res) => {
  try {
    const user = req.user;
    let tickets = [];

    if (user.role !== "user") {
      tickets = await Ticket.find({})
        .populate("assignedTo", ["email", "_id"])
        .sort({ createdAt: -1 });
    } else {
      tickets = await Ticket.find({ createdBy: user._id })
        .select("title description status createdAt")
        .sort({ createdAt: -1 });
    }

    return res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Single Ticket
export const getTicket = async (req, res) => {
  try {
    const user = req.user;
    let ticket;

    if (user.role !== "user") {
      ticket = await Ticket.findById(req.params.id)
        .populate("assignedTo", ["name", "email", "_id"]);
    } else {
      ticket = await Ticket.findOne({
        createdBy: user._id,
        _id: req.params.id,
      }).populate("assignedTo", ["name", "email", "_id"]);
    }

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    return res.status(200).json({ ticket });
  } catch (error) {
    console.error("Error fetching ticket:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
