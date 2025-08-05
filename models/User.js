import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: String,
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
});


const User = mongoose.model('User', UserSchema);
export default User;
