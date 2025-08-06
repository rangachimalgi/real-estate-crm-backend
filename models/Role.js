import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  screens: [String], 
  permissions: [String] 
});

const Role = mongoose.model('Role', RoleSchema);
export default Role;
