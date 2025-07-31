import mongoose, { Schema, Document, Model } from 'mongoose';

interface IResetToken extends Document {
  email: string;
  otp: string;
  expiry: number;
}

const ResetTokenSchema: Schema<IResetToken> = new Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiry: { type: Number, required: true },
});

// 👇 Fix type inference properly for model
const ResetToken: Model<IResetToken> = mongoose.models.ResetToken || mongoose.model<IResetToken>('ResetToken', ResetTokenSchema);

export default ResetToken;
