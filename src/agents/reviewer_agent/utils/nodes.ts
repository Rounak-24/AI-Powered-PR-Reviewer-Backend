import type { GraphNode } from "@langchain/langgraph";
import { ReviewAgentState } from "./state.js";
import { openai } from "../llm/openai_llm.js";
import { ReviewSchema } from "./output_schema.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { systemPrompt } from "../prompts/review_prompt.js";
import { traceable } from 'langsmith/traceable'


const _reviewNode: GraphNode<typeof ReviewAgentState> = async (state)=>{
    const input = `
    pr_metadata: ${JSON.stringify(state.metadata)} 
    changed_files: ${JSON.stringify(state.fileChanges)}
    repo_guidelines: null
    ci_results: null

    Review the PR above and return the JSON object.`

    const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(input)
    ]

    const review = await openai.withStructuredOutput(ReviewSchema).invoke(messages)

    return { review }
}

export const reviewNode:GraphNode<typeof ReviewAgentState> = traceable(_reviewNode,{ 
    name:'review_node', 
    run_type:'chain' 
})