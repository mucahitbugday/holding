import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContentSection {
  type: 'text' | 'card' | 'component';
  order: number;
  content?: string; // Text type için HTML content
  contentId?: string; // Card type için tek içerik ID (backward compatibility)
  contentIds?: string[]; // Card type için birden fazla içerik ID
  componentId?: string; // Component type için component ID
}

export interface IContent extends Document {
  slug: string;
  title: string;
  description?: string;
  content?: string; // Eski format için (backward compatibility)
  sections?: IContentSection[]; // Yeni section-based format
  type: 'page';
  categoryId?: string; // Kategori referansı
  metadata?: {
    image?: string;
    keywords?: string[];
    [key: string]: any;
  };
  featuredImage?: string;
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
      default: '',
      required: false,
    },
    sections: [{
      type: {
        type: String,
        enum: {
          values: ['text', 'card', 'component'],
          message: '`{VALUE}` is not a valid enum value for path `{PATH}`'
        },
        required: true,
      },
      order: {
        type: Number,
        required: true,
      },
      content: String, // Text type için HTML content
      contentId: String, // Card type için tek içerik ID (backward compatibility)
      contentIds: [String], // Card type için birden fazla içerik ID
      componentId: String, // Component type için component ID
    }],
    type: {
      type: String,
      enum: ['page'],
      default: 'page',
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: false,
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

// Model cache'ini tamamen temizle
const getContentModel = (): Model<IContent> => {
  // Model cache'ini temizle
  if (mongoose.models.Content) {
    delete mongoose.models.Content;
  }
  if (mongoose.connection?.models?.Content) {
    delete mongoose.connection.models.Content;
  }
  
  // Yeni schema ile model oluştur
  return mongoose.model<IContent>('Content', ContentSchema);
};

const Content = getContentModel();

export default Content;
