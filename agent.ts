import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { initDB } from "./db";
import { initTools } from "./tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import type { AIMessage, ToolMessage } from "langchain";

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

const toolsNode = new ToolNode(tools)


/**
 * Call Model node
 */
async function callModel(state: typeof MessagesAnnotation.State) {

    const llmWithTools = model.bindTools(tools);

    const response = await llmWithTools.invoke([
        {
            role: "system",
            content: `
            You are helpfull expense tracking assistant. Current datetime: ${new Date().toISOString()}.
            Call add_expense tool to add the expense to database.
            Call get_expenses tool to get the list of expenses for given date range.
            Call generate_expense_chart tool only when user needs to visualize expense
            `
        },
        ...state.messages
    ])

    return { messages: [response]}
};

/**
 * Conditional edge
 */
function shouldContinue(
    state: typeof MessagesAnnotation.State
) {
    const messages = state.messages;
    const lastMessage = messages.at(-1) as AIMessage;

    if (lastMessage.tool_calls?.length) {
        return 'tools';
    }

    return '__end__';
}

function shouldCallModel(
    state: typeof MessagesAnnotation.State
) {
    // todo: change this when chart tool will be implemented

    const messages = state.messages;
    const lastMessage = messages.at(-1) as ToolMessage;

    const message = JSON.parse(lastMessage.content as string);

    if (message.type === "chart") {
        return "__end__";
    };


    return 'callModel';
}



/**
 * Graph
 */

const graph = new StateGraph(MessagesAnnotation)
    .addNode('callModel', callModel)
    .addNode('tools', toolsNode)
    .addEdge('__start__', 'callModel')
    .addConditionalEdges('callModel', shouldContinue, {
        __end__: '__end__',
        tools: 'tools',
    })
    .addConditionalEdges('tools', shouldCallModel, {
        callModel: 'callModel',
        __end__: "__end__"
    });

const agent = graph.compile({
    checkpointer: new MemorySaver(),
});

async function main() {
    const response = await agent.stream(
        {
            messages: [
                {
                    role: 'user',
                    content: 'How much i have spent this month?',
                },
            ],
        },
        {
            streamMode: "updates",
            configurable: { thread_id: '1' }
        }
    );

    for await (const chunk of response) {
        console.log("Chunk",chunk);  
    }

    // console.log(JSON.stringify(response, null, 2));
}

main();