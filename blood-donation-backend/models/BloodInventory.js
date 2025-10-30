// models/BloodInventory.js
import mongoose from 'mongoose';

const bloodInventorySchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  currentStock: {
    type: Number,
    default: 0,
    min: 0
  },
  reservedStock: {
    type: Number,
    default: 0,
    min: 0
  },
  availableStock: {
    type: Number,
    default: 0,
    min: 0
  },
  minimumThreshold: {
    type: Number,
    default: 5
  },
  maximumCapacity: {
    type: Number,
    default: 50
  },
  expiryDates: [{
    unitId: String,
    expiryDate: Date,
    quantity: {
      type: Number,
      default: 1
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'used', 'expired'],
      default: 'available'
    }
  }],
  movements: [{
    type: {
      type: String,
      enum: ['in', 'out', 'adjustment', 'expiry', 'discard'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    reason: String,
    reference: {
      type: {
        type: String,
        enum: ['donation', 'request', 'transfer', 'adjustment']
      },
      id: mongoose.Schema.Types.ObjectId
    },
    previousStock: Number,
    newStock: Number,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  alerts: [{
    type: {
      type: String,
      enum: ['low_stock', 'expiring_soon', 'overstock', 'threshold_breach'],
      required: true
    },
    level: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'warning'
    },
    message: String,
    triggeredAt: {
      type: Date,
      default: Date.now
    },
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index
bloodInventorySchema.index({ hospital: 1, bloodType: 1 }, { unique: true });
bloodInventorySchema.index({ 'expiryDates.expiryDate': 1 });

// Pre-save middleware to calculate available stock
bloodInventorySchema.pre('save', function(next) {
  this.availableStock = Math.max(0, this.currentStock - this.reservedStock);
  this.lastUpdated = new Date();
  next();
});

// Static method to get inventory summary for a hospital
bloodInventorySchema.statics.getHospitalSummary = async function(hospitalId) {
  const inventory = await this.find({ hospital: hospitalId });
  
  const summary = {
    totalStock: 0,
    totalReserved: 0,
    totalAvailable: 0,
    byBloodType: {},
    lowStockAlerts: [],
    expiringSoon: []
  };

  inventory.forEach(item => {
    summary.totalStock += item.currentStock;
    summary.totalReserved += item.reservedStock;
    summary.totalAvailable += item.availableStock;

    summary.byBloodType[item.bloodType] = {
      currentStock: item.currentStock,
      reservedStock: item.reservedStock,
      availableStock: item.availableStock,
      status: item.getStockStatus()
    };

    // Check for low stock
    if (item.availableStock <= item.minimumThreshold) {
      summary.lowStockAlerts.push({
        bloodType: item.bloodType,
        currentStock: item.availableStock,
        threshold: item.minimumThreshold,
        level: item.availableStock === 0 ? 'critical' : 'warning'
      });
    }

    // Check for expiring units (within 7 days)
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const expiring = item.expiryDates.filter(expiry => 
      expiry.status === 'available' && 
      expiry.expiryDate <= sevenDaysFromNow
    );

    if (expiring.length > 0) {
      summary.expiringSoon.push({
        bloodType: item.bloodType,
        units: expiring.length,
        earliestExpiry: expiring.reduce((earliest, current) => 
          current.expiryDate < earliest ? current.expiryDate : earliest, 
          expiring[0].expiryDate
        )
      });
    }
  });

  return summary;
};

// Instance method to get stock status
bloodInventorySchema.methods.getStockStatus = function() {
  const percentage = (this.availableStock / this.maximumCapacity) * 100;

  if (this.availableStock === 0) return 'out_of_stock';
  if (this.availableStock <= this.minimumThreshold) return 'low';
  if (percentage >= 90) return 'full';
  if (percentage >= 70) return 'adequate';
  return 'good';
};

// Instance method to add stock
bloodInventorySchema.methods.addStock = async function(quantity, options = {}) {
  const { unitId, expiryDate, reason, reference, performedBy, notes } = options;

  this.currentStock += quantity;

  // Add expiry date if provided
  if (unitId && expiryDate) {
    this.expiryDates.push({
      unitId,
      expiryDate,
      quantity: quantity,
      status: 'available'
    });
  }

  // Record movement
  this.movements.push({
    type: 'in',
    quantity,
    reason: reason || 'Stock addition',
    reference,
    previousStock: this.currentStock - quantity,
    newStock: this.currentStock,
    performedBy,
    notes
  });

  await this.save();
};

// Instance method to reserve stock
bloodInventorySchema.methods.reserveStock = async function(quantity, options = {}) {
  if (this.availableStock < quantity) {
    throw new Error(`Insufficient available stock. Available: ${this.availableStock}, Requested: ${quantity}`);
  }

  this.reservedStock += quantity;

  const { reason, reference, performedBy, notes } = options;

  this.movements.push({
    type: 'out',
    quantity,
    reason: reason || 'Stock reservation',
    reference,
    previousStock: this.currentStock,
    newStock: this.currentStock,
    performedBy,
    notes
  });

  await this.save();
};

// Instance method to release reserved stock
bloodInventorySchema.methods.releaseReservedStock = async function(quantity, options = {}) {
  if (this.reservedStock < quantity) {
    throw new Error(`Insufficient reserved stock. Reserved: ${this.reservedStock}, Requested: ${quantity}`);
  }

  this.reservedStock -= quantity;

  const { reason, performedBy, notes } = options;

  this.movements.push({
    type: 'adjustment',
    quantity: -quantity,
    reason: reason || 'Reservation release',
    previousStock: this.currentStock,
    newStock: this.currentStock,
    performedBy,
    notes
  });

  await this.save();
};

export default mongoose.model('BloodInventory', bloodInventorySchema);