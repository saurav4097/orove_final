import mongoose, { Schema, Document, Model } from 'mongoose';

interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  isPremium: boolean; // 👈 Add this
  premiumExpiresAt:Date|null;
  tried:number;
}

const UserSchema: Schema<IUser> = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  isPremium: { type: Boolean, default: false }, // 👈 Add this line
  premiumExpiresAt: { type: Date, default: null },
  tried:{type:Number,default:0},
});

// ✅ Safety net on save: if already expired, flip it off.
UserSchema.pre('save', function (this: any, next) {
  if (this.isPremium && this.premiumExpiresAt && this.premiumExpiresAt < new Date()) {
    this.isPremium = false;
    this.premiumExpiresAt = null; // use null (matches schema default)
  }
  next();
});

// ✅ Auto-expire on reads: if someone fetches the user and it's expired, fix it immediately.
UserSchema.post('findOne', async function (doc: any) {
  if (!doc) return;
  if (doc.isPremium && doc.premiumExpiresAt && doc.premiumExpiresAt < new Date()) {
    doc.isPremium = false;
    doc.premiumExpiresAt = null;
    await doc.save();
  }
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
