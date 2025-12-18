import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  order?: number;
  autoAddContent?: boolean; // Otomatik içerik ekleme aktif mi?
  autoAddLimit?: number; // Otomatik ekleme limiti (son 5, son 10 gibi)
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    autoAddContent: {
      type: Boolean,
      default: false,
    },
    autoAddLimit: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Model cache'ini temizle ve yeniden oluştur
if (mongoose.models.Category) {
  delete mongoose.models.Category;
}

const Category: Model<ICategory> = mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
