import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getPrs } from "./pr.services.js";
import type { Request, Response } from 'express'


export const handleGetPr = asyncHandler(async (req:Request,res:Response)=>{
    const { userId } = req.user

    const prs = await getPrs(userId as string)
    if(!prs || prs.length===0){
        return res.json(new ApiError(404,'PRs not found'))
    }
    
    return res.json(new ApiResponse(200,{prs},'PRs fetched successfully'))
})