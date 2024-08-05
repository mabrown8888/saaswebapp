import { model, models, Schema } from "mongoose";

// this is our interface
export interface IImage extends Document { // extending from Doc auto gives fields like id --> export because we are using in frontend
    title: string;
    transformatioNType: string;
    publicId: string;
    secureUrl: string;
    width?: number;
    height?: number;
    config?: object;
    transformationUrl?: string;
    aspectRatio?: string;
    color?: string;
    prompt?: string;
    author: {
        _id: string;
        firstName: string;
        lastName: string;
    }
    createdAt?: Date;
    updatedAt?: Date;
}

// this is our schema - model - structor for future documents based on this schema.
const ImageSchema = new Schema({
    title: { type: String, required: true },
    transformationType: { type: String, required: true },
    publicId: { type: String, required: true },
    secureUrl: { type: URL, required: true },
    width: { type: Number },
    height: { type: Number },
    config: { type: Object },
    transformationUrl: { type: URL },
    aspectRatio: { type: String },
    color: { type: String },
    prompt: { type: String },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// now we want to turn this schema into a model for MongoDB
// to create type of image - leverage chatGPT to create an IImage interface based off of following imageSchema?

const Image = models?.Image || model('Image', ImageSchema);

export default Image;
