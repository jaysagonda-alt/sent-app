import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();

// Auth middleware
const authMiddleware = (req: Request, res: Response, next: Function) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// GET conversations
router.get("/conversations", authMiddleware, async (req: Request, res: Response) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { fromId: req.userId },
          { toId: req.userId },
        ],
      },
      include: {
        from: { select: { id: true, name: true, email: true } },
        to: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Group by conversation partner
    const conversationMap = new Map();
    messages.forEach((msg) => {
      const partnerId = msg.fromId === req.userId ? msg.toId : msg.fromId;
      const partner = msg.fromId === req.userId ? msg.to : msg.from;

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          userId: partnerId,
          name: partner.name,
          email: partner.email,
          lastMessage: msg.content,
        });
      }
    });

    res.json(Array.from(conversationMap.values()));
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// GET messages with a user
router.get("/:userId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { fromId: req.userId, toId: userId },
          { fromId: userId, toId: req.userId },
        ],
      },
      include: {
        from: { select: { id: true, name: true, email: true } },
        to: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// POST send message
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { toId, content } = req.body;

    if (!toId || !content || content.trim().length === 0) {
      return res.status(400).json({ error: "ToId and content are required" });
    }

    const message = await prisma.message.create({
      data: {
        fromId: req.userId!,
        toId,
        content: content.trim(),
      },
      include: {
        from: { select: { id: true, name: true, email: true } },
        to: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
