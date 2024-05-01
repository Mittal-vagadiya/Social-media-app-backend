import { CreateResponse } from "../../helper.js"

export const archivePost = (req, res) => {
    try {


    } catch (error) {
        res.status(400).json(CreateResponse(error))
    }
}