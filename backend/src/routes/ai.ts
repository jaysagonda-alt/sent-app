import { Router } from 'express';
const router = Router();

// GET /api/ai/conversation-starters
router.get('/conversation-starters', (req, res) => {
  const conversationStarters = [
    { text: 'What drew you to mission work?', category: 'mission' },
    { text: 'How has your faith journey shaped your calling?', category: 'faith' },
    { text: 'What is one scripture that guides your life?', category: 'faith' },
    { text: 'Tell me about your mission organization and what you do.', category: 'mission' },
  ];
  
  res.json(conversationStarters);
});

export default router;
