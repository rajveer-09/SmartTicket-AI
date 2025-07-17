import { inngest } from "./client.js";
import  User from "../models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../utils/email.js";
import Ticket from "../models/ticket.js";
import analyzeTicket from "../../utils/ai.js";

export const onTicketCreated = inngest.createFunction(
  {id: "on-ticket-create", retries: 2},
  { event: "ticket/created" },
  async ({ event, step }) => {
    try {
        const { ticketId} = event.data;
        const ticket = await step.run("fetch-ticket", async () => {
            const ticketObject = await Ticket.findById(ticketId);
            if (!ticketObject) {
                throw new NonRetriableError("Ticket not found");
            }
            return ticketObject;
        });

       await step.run("update-ticket-status", async () => {
           await Ticket.findOneAndUpdate(
               { _id: ticketId },   
               { status: "open" },
               { new: true }
           );
       });

       const aiResponse = await analyzeTicket(ticket);

       const relatedSkills = await step.run("ai-processing", async () => {
            let skills = []
            if (aiResponse) {
               await Ticket.findByIdAndUpdate(ticketId, {
                   priority:["low", "medium", "high"].includes(aiResponse.priority) ? aiResponse.priority : "medium",
                   helpfulNotes: aiResponse.helpfulNotes ? aiResponse.helpfulNotes : [],
                   status: "IN_PROGRESS",
                   relatedSkills: aiResponse.relatedSkills ? aiResponse.relatedSkills : [],
               })

               skills = aiResponse.relatedSkills || [];
           }

           return skills
       });

       const moderator = await step.run("assign-moderator", async () => {
           let user = await  User.findOne({
            role: "moderator",
            skills: {
                elemMatch:{
                    $regex: relatedSkills.join("|"),
                    $options: "i",
                },
            },
           });

           if(!user){
            user = await User.findOne({ role: "admin" });
           }

           await Ticket.findByIdAndUpdate(ticketId, {
               assignedTo: user ? user._id : null,
           });

           return user;
       });

       await step.run("send-notification", async () => {
           if (moderator) {
               const subject = `New Ticket Assigned: ${ticket.title}`;
               const message = `Hello ${moderator.name},\n\nA new ticket has been assigned to you:\n\nTitle: ${ticket.title}\nDescription: ${ticket.description}\nPriority: ${ticket.priority}\n\nPlease check the ticket and take necessary actions.\n\nBest regards,\nTicketing System Team`;

               await sendMail(moderator.email, subject, message);
           }
       });

       return {success : true}
       
    } catch (error) {
      console.error(`❌ Error creating ticket: ${error.message}`);
      return { success: false };
    }
  }
);