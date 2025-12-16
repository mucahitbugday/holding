import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IResetCode extends Document {
  email: string;
  code: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const ResetCodeSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    code: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
ResetCodeSchema.index({ email: 1, code: 1 });

const ResetCode: Model<IResetCode> = mongoose.models.ResetCode || mongoose.model<IResetCode>('ResetCode', ResetCodeSchema);

export default ResetCode;
