import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { findUserById } from "./user.services.js";
import type { Request, Response } from 'express'

export const getProfileHandler = asyncHandler(async (req:Request, res:Response)=>{
    const { userId } = req.user as { userId?: string }
    if(!userId) throw new ApiError(400, 'userId is missing')

    const user = await findUserById(userId as string)
    if(!user) throw new ApiError(404, 'User not found')

    return res.json(new ApiResponse(200, user, 'User profile fetched successfully'))
})