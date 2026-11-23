import { asyncHandler } from "../../utils/asyncHandler.js";
import type { Request, Response } from 'express'
import { getInstallation } from "./github_installation.services.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";


export const handleInstallation = asyncHandler(async (req:Request,res:Response)=>{
    const installationUrl = 'https://github.com/apps/CodeLens-PR-ReviewerByRounak/installations/new'
    return res.redirect(installationUrl)
})


export const getInstallationHandler = asyncHandler(async (req:Request,res:Response)=>{
    const { userId } = req.user

    const installation = await getInstallation(userId as string)
    if(!installation || installation.length===0){
        return res.json(new ApiError(404,'Installation not found'))
    }

    return res.json(new ApiResponse(200,{installation:installation[0]},'installation fetched successfully'))
})