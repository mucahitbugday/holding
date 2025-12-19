import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHeroSlide {
  title: string;
  description: string;
  link: string;
  linkText: string;
  image: string;
  order: number;
}

export interface IAboutItem {
  title: string;
  description: string;
  icon?: string;
  order: number;
}

export interface IHomePageSection {
  type: 'hero' | 'about' | 'services' | 'hrpolicy' | 'news' | 'contact' | 'component';
  order: number;
  isActive: boolean;
  data: {
    // Hero data
    slides?: IHeroSlide[];
    // About data
    title?: string;
    description?: string;
    items?: IAboutItem[];
    // Component data
    componentId?: string;
    // Diğer componentler için genel data
    [key: string]: any;
  };
}

export interface IHomePageSettings extends Document {
  sections: IHomePageSection[];
  createdAt: Date;
  updatedAt: Date;
}

const HeroSlideSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  link: { type: String, required: true },
  linkText: { type: String, required: true },
  image: { type: String, required: true },
  order: { type: Number, required: true, default: 0 },
});

const AboutItemSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String },
  order: { type: Number, required: true, default: 0 },
});

const HomePageSectionSchema: Schema = new Schema({
  type: {
    type: String,
    enum: {
      values: ['hero', 'about', 'services', 'hrpolicy', 'news', 'contact', 'component'],
      message: '`{VALUE}` is not a valid enum value for path `{PATH}`'
    },
    required: true,
  },
  order: { type: Number, required: true, default: 0 },
  isActive: { type: Boolean, default: true },
  data: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, {
  _id: false
});

const HomePageSettingsSchema: Schema = new Schema(
  {
    sections: [HomePageSectionSchema],
  },
  {
    timestamps: true,
  }
);

// Model cache'ini tamamen temizle - her seferinde yeni schema ile oluştur
const getHomePageSettingsModel = (): Model<IHomePageSettings> => {
  // Model cache'ini temizle
  if (mongoose.models.HomePageSettings) {
    delete mongoose.models.HomePageSettings;
  }
  if (mongoose.connection?.models?.HomePageSettings) {
    delete mongoose.connection.models.HomePageSettings;
  }
  
  // Yeni schema ile model oluştur
  return mongoose.model<IHomePageSettings>('HomePageSettings', HomePageSettingsSchema);
};

const HomePageSettings = getHomePageSettingsModel();

export default HomePageSettings;
