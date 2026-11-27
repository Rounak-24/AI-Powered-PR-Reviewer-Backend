import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { ReviewAgentState, type StateObject } from "./utils/state.js";
import { reviewNode } from "./utils/nodes.js";
import { ReviewSchema } from "./utils/output_schema.js";

const checkpointer = new MemorySaver()

const reviewAgent = new StateGraph(ReviewAgentState)
    .addNode('reviewNode', reviewNode)
    .addEdge(START,'reviewNode')
    .addEdge('reviewNode',END)
    .compile({ checkpointer })


export const invokeReviewAgent = async (userId:string, initialState:StateObject)=>{
    try{
        const config = { configurable: { thread_id: userId } }
        const finalState = await reviewAgent.invoke(initialState, config)
        return ReviewSchema.parse(finalState.review)

    }catch(err){
        console.log(`Something went wrong in reviewAgent,${err}`)
        throw err
    }
}