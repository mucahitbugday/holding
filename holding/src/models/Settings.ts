import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  // Genel Bilgiler
  siteName: string;
  siteDescription: string;
  siteLogo?: string;
  
  // Şirket Bilgileri
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyFounder?: string;
  companyFoundedYear?: number;
  companyTaxNumber?: string;
  companyTradeRegistryNumber?: string;
  
  // SEO
  googleMapsLink?: string;
  metaKeywords?: string[];
  metaDescription?: string;
  
  // SMTP Ayarları
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    fromEmail: string;
    fromName: string;
  };
  
  // Sosyal Medya
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  
  // Google Analytics
  googleAnalytics?: {
    measurementId?: string;
    apiKey?: string;
    propertyId?: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema: Schema = new Schema(
  {
    // Genel Bilgiler
    siteName: {
      type: String,
      required: true,
      default: 'Holding Şirketi',
    },
    siteDescription: {
      type: String,
      default: '',
    },
    siteLogo: {
      type: String,
      default: '',
    },
    
    // Şirket Bilgileri
    companyName: {
      type: String,
      required: true,
      default: '',
    },
    companyAddress: {
      type: String,
      default: '',
    },
    companyPhone: {
      type: String,
      default: '',
    },
    companyEmail: {
      type: String,
      default: '',
    },
    companyFounder: {
      type: String,
      default: '',
    },
    companyFoundedYear: {
      type: Number,
      default: null,
    },
    companyTaxNumber: {
      type: String,
      default: '',
    },
    companyTradeRegistryNumber: {
      type: String,
      default: '',
    },
    
    // SEO
    googleMapsLink: {
      type: String,
      default: '',
    },
    metaKeywords: {
      type: [String],
      default: [],
    },
    metaDescription: {
      type: String,
      default: '',
    },
    
    // SMTP Ayarları
    smtp: {
      host: {
        type: String,
        default: '',
      },
      port: {
        type: Number,
        default: 587,
      },
      secure: {
        type: Boolean,
        default: false,
      },
      user: {
        type: String,
        default: '',
      },
      password: {
        type: String,
        default: '',
      },
      fromEmail: {
        type: String,
        default: '',
      },
      fromName: {
        type: String,
        default: '',
      },
    },
    
    // Sosyal Medya
    socialMedia: {
      facebook: {
        type: String,
        default: '',
      },
      twitter: {
        type: String,
        default: '',
      },
      instagram: {
        type: String,
        default: '',
      },
      linkedin: {
        type: String,
        default: '',
      },
      youtube: {
        type: String,
        default: '',
      },
    },
    
    // Google Analytics
    googleAnalytics: {
      measurementId: {
        type: String,
        default: '',
      },
      apiKey: {
        type: String,
        default: '',
      },
      propertyId: {
        type: String,
        default: '',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Singleton pattern - sadece bir settings kaydı olacak
SettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
