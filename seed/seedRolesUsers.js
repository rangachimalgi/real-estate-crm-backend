import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import Role from '../models/Role.js';
import User from "../models/User.js"

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🧠 Connected to DB');

    await Role.deleteMany();
    await User.deleteMany();

    const roles = {
      superadmin: await Role.create({
        name: 'superadmin',
        screens: ['Dashboard', 'Leads', 'SiteVisits', 'Properties', 'Bookings', 'Payments', 'Chat', 'SiteStaff', 'Reports']
      }),
      manager: await Role.create({
        name: 'manager',
        screens: ['Dashboard', 'Leads', 'SiteVisits', 'Properties', 'Bookings', 'Payments', 'Chat']
      }),
      executive: await Role.create({
        name: 'executive',
        screens: ['Leads', 'SiteVisits', 'Properties', 'Chat']
      }),
    };

    const hash = (pwd) => bcrypt.hashSync(pwd, 10);

    await User.create([
      {
        username: 'admin',
        password: hash('admin123'),
        name: 'Super Admin',
        role: roles.superadmin._id,
      },
      {
        username: 'manager',
        password: hash('manager123'),
        name: 'Manager Mohan',
        role: roles.manager._id,
      },
      {
        username: 'executive',
        password: hash('exec123'),
        name: 'Executive Raj',
        role: roles.executive._id,
      },
    ]);

    console.log('✅ Roles and users seeded');
    process.exit();
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
