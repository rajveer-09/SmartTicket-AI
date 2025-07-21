import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.model.js";

// ✅ Create Ticket
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

    return res.status(201).json({ message: "Ticket created successfully", ticket: newTicket });
  } catch (error) {
    console.error("Error creating ticket:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get All Tickets
export const getTickets = async (req, res) => {
  try {
    const user = req.user;
    let tickets = [];

    if (user.role === "admin") {
      tickets = await Ticket.find({})
        .populate("assignedTo", ["name", "email", "_id"])
        .sort({ createdAt: -1 });
    } else if (user.role === "moderator") {
      tickets = await Ticket.find({
        $or: [{ assignedTo: user._id }, { createdBy: user._id }],
      })
        .populate("assignedTo", ["name", "email", "_id"])
        .sort({ createdAt: -1 });
    } else {
      tickets = await Ticket.find({ createdBy: user._id })
        .populate("assignedTo", ["name", "email", "_id"])
        .sort({ createdAt: -1 });
    }

    return res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get Single Ticket 
export const getTicket = async (req, res) => {
  try {
    const user = req.user;
    let ticket;

    const selectFields = "title description status createdAt priority relatedSkills assignedTo aiNotes helpfulNotes moderatorMessage";

    if (user.role === "admin") {
      ticket = await Ticket.findById(req.params.id)
        .select(selectFields)
        .populate("assignedTo", ["name", "email", "_id"]);
    } else if (user.role === "moderator") {
      ticket = await Ticket.findOne({
        _id: req.params.id,
        $or: [{ assignedTo: user._id }, { createdBy: user._id }],
      })
        .select(selectFields)
        .populate("assignedTo", ["name", "email", "_id"]);
    } else {
      ticket = await Ticket.findOne({
        _id: req.params.id,
        createdBy: user._id,
      })
        .select(selectFields)
        .populate("assignedTo", ["name", "email", "_id"]);
    }

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found or access denied" });
    }

    return res.status(200).json({ ticket });
  } catch (error) {
    console.error("Error fetching ticket:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// Update Ticket — Only Admin 
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, moderatorMessage, assignedTo } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can update ticket details" });
    }

    ticket.title = title;
    ticket.description = description;

    if (moderatorMessage !== undefined) {
      ticket.moderatorMessage = moderatorMessage;
    }

    if (assignedTo !== undefined) {
      ticket.assignedTo = assignedTo || null;
    }

    await ticket.save();

    return res.status(200).json({ message: "Ticket updated successfully", ticket });
  } catch (error) {
    console.error("Error updating ticket:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// Update Ticket Status — Admin, Moderator, Assigned User can update status & moderatorMessage
export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, moderatorMessage } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const allowedStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (
      req.user.role !== "admin" &&
      req.user.role !== "moderator" &&
      ticket.assignedTo?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to update this ticket" });
    }

    ticket.status = status;

    if (moderatorMessage !== undefined) {
      ticket.moderatorMessage = moderatorMessage;
    }

    await ticket.save();

    return res.status(200).json({ message: "Ticket status updated", ticket });
  } catch (error) {
    console.error("Error updating ticket status:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
