import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMedia extends Document {
  filename: string;
  originalName: string;
  url: string;
  type: 'image' | 'pdf' | 'other';
  mimeType: string;
  size: number;
  uploadedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema: Schema = new Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['image', 'pdf', 'other'],
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Media: Model<IMedia> = mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema);

export default Media;
