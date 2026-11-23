import type { Request, Response } from 'express'
import { handleInstallationHook, handlePRHook, verifyGithubSignature } from "./webhook.services.js";


export const webhookController = async (req:Request,res:Response)=>{
    try{
        const signature = req.headers['x-hub-signature-256'] as string

        if (!await verifyGithubSignature(signature, JSON.stringify(req.body))){
            return res.status(401).json({ error: 'Invalid webhook signature' })
        }

        const event = req.headers['x-github-event'] as string
        console.log(`Github event occured:${event}`)

        switch(event){
            case('ping'):{
                console.log('ping event received, hook is:', req.body['hook']['active'] ? 'active' : 'inactive')
                return res.status(200).json({ message: 'pong' })
            }

            case('installation'):{ await handleInstallationHook(req.body)}
            case('pull_request'):{ await handlePRHook(req.body)  }     
        }

        return res.status(200).json({'success':'webhook event completed'})

    }catch(err){
        console.log(`Error:${err}`)
        return res.status(500).json({
            message:'Something went wrong in webhook controller',
            error:err
        })
    }
}    