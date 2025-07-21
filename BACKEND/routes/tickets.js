import express from "express";
import { authenticate } from "../middlewares/auth.js";
import { 
  createTicket, 
  getTickets, 
  getTicket, 
  updateTicket, 
  updateTicketStatus 
} from "../controllers/ticket.js";

const router = express.Router();

router.post("/", authenticate, createTicket);
router.get("/", authenticate, getTickets);
router.get("/:id", authenticate, getTicket);
router.put("/:id", authenticate, updateTicket);
router.put("/:id/status", authenticate, updateTicketStatus);

export default router;
