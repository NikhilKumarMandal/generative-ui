import { tool } from "langchain";
import * as z from "zod";
import { DatabaseSync } from "node:sqlite";

export function initTools(database: DatabaseSync) {
    
    /**
   * AddExpense tool
   */
    const addExpense = tool(
        ({ title, amount }) => {
            // todo: do proper args validation
            const date = new Date().toISOString().split('T')[0];

            const stmt = database.prepare(
                `INSERT INTO expenses (title, amount, date) VALUES (?, ?, ?)`
            );
            stmt.run(title, amount, date);

            return JSON.stringify({ status: 'success!' });
        },
        {
            name: 'add_expense',
            description: 'Add the given expense to database',
            schema: z.object({
                title: z.string().describe('The expense title'),
                amount: z.number().describe('The amount spent'),
            }),
        }
    );


    return [
        addExpense
    ];

};




