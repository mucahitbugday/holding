import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComponent extends Document {
  name: string;
  slug: string;
  type: 'hero' | 'news' | 'map' | 'custom' | 'card' | 'section';
  description?: string;
  html: string;
  css?: string;
  js?: string;
  isActive: boolean;
  order: number;
  categoryId?: string;
  settings?: {
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ComponentSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    type: {
      type: String,
      enum: ['hero', 'news', 'map', 'custom', 'card', 'section'],
      required: true,
      default: 'custom',
    },
    description: {
      type: String,
      default: '',
    },
    html: {
      type: String,
      required: true,
      default: '',
    },
    css: {
      type: String,
      default: '',
    },
    js: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    settings: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Slug index
ComponentSchema.index({ slug: 1 });
ComponentSchema.index({ type: 1 });
ComponentSchema.index({ isActive: 1 });

const Component: Model<IComponent> =
  mongoose.models.Component || mongoose.model<IComponent>('Component', ComponentSchema);

export default Component;

