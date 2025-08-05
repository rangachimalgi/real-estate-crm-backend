import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true }, // 'manager', 'executive', etc
  screens: [String], // e.g. ['Dashboard', 'Leads']
  permissions: [String] // optional
});

const Role = mongoose.model('Role', RoleSchema);
export default Role;
