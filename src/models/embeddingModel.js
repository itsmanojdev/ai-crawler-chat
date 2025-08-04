import mongoose from 'mongoose'

const embeddingSchema = mongoose.Schema({
    domain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Website'
    },
    website_url: {
        type: String,
        default: ""
    },
    chunk_id: {
        type: Number,
        default: 1
    },
    chunk: String,
    embedding: {
        type: [Number],
        default: undefined
    }
},
    {
        timestamps: true
    }
)

const embeddingModel = mongoose.models.Embedding || mongoose.model('Embedding', embeddingSchema)

export default embeddingModel