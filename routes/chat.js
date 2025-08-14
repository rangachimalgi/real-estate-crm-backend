import express from 'express';
import jwt from 'jsonwebtoken';
import Chat from '../models/Chat.js';
import User from '../models/User.js';

const router = express.Router();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Get all chat conversations for a user
router.get('/conversations/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const conversations = await Chat.find({
      participants: userId,
      isActive: true
    })
    .populate('participants', 'name username role')
    .populate('messages.sender', 'name username')
    .sort({ lastMessage: -1 });

    // Format conversations for frontend
    const formattedConversations = conversations.map(chat => {
      const otherParticipant = chat.participants.find(p => p._id.toString() !== userId);
      const lastMessage = chat.messages[chat.messages.length - 1];
      
      // Ensure we have a valid participant
      if (!otherParticipant) {
        console.warn('Chat without valid participant found:', chat._id);
        return null;
      }
      
      return {
        id: chat._id,
        participant: {
          id: otherParticipant._id,
          name: otherParticipant.name,
          username: otherParticipant.username,
          role: otherParticipant.role?.name || 'Unknown'
        },
        lastMessage: lastMessage ? {
          text: lastMessage.text,
          timestamp: lastMessage.timestamp,
          sender: lastMessage.sender?.name || 'Unknown'
        } : null,
        unreadCount: chat.messages.filter(m => 
          m.sender._id.toString() !== userId && !m.read
        ).length,
        timestamp: chat.lastMessage || new Date()
      };
    }).filter(Boolean); // Remove any null entries

    res.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages for a specific chat
router.get('/messages/:chatId', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    
    const chat = await Chat.findById(chatId)
      .populate('participants', 'name username role')
      .populate('messages.sender', 'name username');

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({
      chatId: chat._id,
      participants: chat.participants,
      messages: chat.messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/messages', authenticateToken, async (req, res) => {
  try {
    const { chatId, senderId, text, type = 'text', mediaUrl, fileName, fileSize } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const newMessage = {
      sender: senderId,
      text,
      type,
      mediaUrl,
      fileName,
      fileSize,
      timestamp: new Date()
    };

    chat.messages.push(newMessage);
    chat.lastMessage = new Date();
    await chat.save();

    // Populate sender info for response
    await chat.populate('messages.sender', 'name username');
    const savedMessage = chat.messages[chat.messages.length - 1];

    res.json(savedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Create a new chat conversation
router.post('/conversations', authenticateToken, async (req, res) => {
  try {
    const { participantIds } = req.body;

    if (!participantIds || participantIds.length < 2) {
      return res.status(400).json({ error: 'At least 2 participants required' });
    }

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      participants: { $all: participantIds },
      isActive: true
    });

    if (existingChat) {
      return res.json(existingChat);
    }

    const newChat = new Chat({
      participants: participantIds,
      messages: []
    });

    const savedChat = await newChat.save();
    await savedChat.populate('participants', 'name username role');

    res.status(201).json(savedChat);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get all users for chat (excluding current user)
router.get('/users/:currentUserId', authenticateToken, async (req, res) => {
  try {
    const { currentUserId } = req.params;
    
    const users = await User.find({ _id: { $ne: currentUserId } })
      .select('name username role')
      .populate('role', 'name');

    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      username: user.username,
      role: user.role?.name || 'Unknown'
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
