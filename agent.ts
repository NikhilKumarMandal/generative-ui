import { ChatOpenAI } from "@langchain/openai";
import { MessagesAnnotation } from "@langchain/langgraph";
import { initDB } from "./db";
import { initTools } from "./tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";

/**
 * Init database
 */
const database = initDB("./expenses.db");

const tools = initTools(database);

/**
 * Initialise the LLM
 */
const model = new ChatOpenAI({
    model: "gpt-4.1",
});

/**
 * Tool Node
 */

const tooleNode = new ToolNode(tools)


async function callModel(state: typeof MessagesAnnotation.State) {

    const llmWithTools = model.bindTools(tools);

    const response = await llmWithTools.invoke([
        {
            role: "system",
            content: `
            You are helpfull expense tracking assistant. Current datetime: ${new Date().toISOString()}.
            call add_expense tool to add the expense to database.
            `
        },
        ...state.messages
    ])

    return { messages: [response]}
};
