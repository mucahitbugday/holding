import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMenuItem {
  label: string;
  href: string;
  order: number;
  imageUrl?: string; // Resim URL'i
  pdfUrl?: string; // PDF URL'i
  children?: IMenuItem[];
}

export interface IMenu extends Document {
  name: string;
  type: 'main' | 'footer';
  items: IMenuItem[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema: Schema = new Schema({
  label: { type: String, required: true },
  href: { type: String, required: true },
  order: { type: Number, required: true },
  imageUrl: { type: String }, // Resim URL'i
  pdfUrl: { type: String }, // PDF URL'i
  children: [{ type: Schema.Types.Mixed }],
});

const MenuSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['main', 'footer'],
      required: true,
    },
    items: [MenuItemSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Menu: Model<IMenu> = mongoose.models.Menu || mongoose.model<IMenu>('Menu', MenuSchema);

export default Menu;
