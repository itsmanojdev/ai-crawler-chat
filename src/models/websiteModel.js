import mongoose from 'mongoose'
import { CRAWL_STATUS, CRAWL_TYPE } from "../constants.js";

const websiteSchema = mongoose.Schema({
    website_url: {
        type: String,
        required: true
    },
    crawl_status: {
        type: String,
        default: CRAWL_STATUS.PENDING
    },
    crawl_type: {
        type: String,
        default: CRAWL_TYPE.PAGE
    }
},
    {
        timestamps: true
    }
)

const websiteModel = mongoose.model('Website', websiteSchema)

export default websiteModel