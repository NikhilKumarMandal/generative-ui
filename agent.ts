import { ChatOpenAI } from "@langchain/openai";
import { MessagesAnnotation } from "@langchain/langgraph";
import { initDB } from "./db";

/**
 * Init database
 */
const database = initDB("./expenses.db")

/**
 * Initialise the LLM
 */
const model = new ChatOpenAI({
    model: "gpt-4.1",
});



async function callModel(state: typeof MessagesAnnotation.State) {


    return state;
};
