import mongoose from 'mongoose';

const SiteVisitSchema = new mongoose.Schema({
  name: String,
  phoneNumber: String,
  occupation: String,
  location: String,
  timeOfVisit: Date,
  projectName: String,
  scheduled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const SiteVisit = mongoose.model('SiteVisit', SiteVisitSchema);
export default SiteVisit;
