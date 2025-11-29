import { ChatOpenAI } from "@langchain/openai";
import { MessagesAnnotation } from "@langchain/langgraph";


const model = new ChatOpenAI({
    model: "gpt-4.1",
});



async function callModel(state: typeof MessagesAnnotation.State) {


    return state;
};
