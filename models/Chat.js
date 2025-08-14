import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  type: { type: String, enum: ['text', 'image', 'document', 'video'], default: 'text' },
  mediaUrl: String,
  fileName: String,
  fileSize: Number,
  timestamp: { type: Date, default: Date.now }
});

const ChatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  messages: [MessageSchema],
  lastMessage: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Chat = mongoose.model('Chat', ChatSchema);
export default Chat;
