import { Schema, model, models } from 'mongoose';
import { iProduct } from '../Interfaces'

const productSchema = new Schema<iProduct>({
    createdDate: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
        required: true
    },
    name: {
        type: String
    },
    description: {
        type: String
    },
    address: {
        type: String,
      },
    images: [],

}, { strict: true })
export default models.Product || model('Product', productSchema);

// export default model('Review', reviewSchema)
