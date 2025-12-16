import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContent extends Document {
  slug: string;
  title: string;
  description?: string;
  content: string;
  type: 'page';
  metadata?: {
    image?: string;
    keywords?: string[];
    [key: string]: any;
  };
  isActive: boolean;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema: Schema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['page'],
      default: 'page',
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Content: Model<IContent> = mongoose.models.Content || mongoose.model<IContent>('Content', ContentSchema);

export default Content;
