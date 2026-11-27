import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import type { Request, Response } from 'express'
import { getPRById } from "../pr/pr.services.js";
import { getAgentReview } from "./review.services.js";
import { ApiResponse } from "../../utils/ApiResponse.js";


export const generateReviewHandler = asyncHandler(async (req:Request,res:Response)=>{
    const { prId } = req.query as { prId:string }
    if(!prId) throw new ApiError(400,'pr_id is missing')

    const prData = await getPRById(prId)
    const review = await getAgentReview(prData, req.user?.userId)

    if(!review) throw new ApiError(500,'Something went wrong in agent')
    return res.json(new ApiResponse(200,{review},'review generated successfully'))
})