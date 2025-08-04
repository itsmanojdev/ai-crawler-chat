import "./mongodb.js"
import websiteModel from "../models/websiteModel.js"

const getWebsites = async () => {
    try {
        let websites = await websiteModel.find({}).exec()
        return websites;
    } catch (error) {
        console.log("Fetch Error: ", error.message)

    }
}

export {
    getWebsites
}