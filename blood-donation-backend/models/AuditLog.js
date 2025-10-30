// models/AuditLog.js
import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    required: true
  },
  entity: {
    type: String,
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  description: String,
  ipAddress: String,
  userAgent: String,
  changes: mongoose.Schema.Types.Mixed,
  previousState: mongoose.Schema.Types.Mixed,
  newState: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ entity: 1, entityId: 1 });

export default mongoose.model('AuditLog', auditLogSchema);