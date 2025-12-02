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


    /**
  * Get expenses tool
  */
    const getExpenses = tool(
        ({ from, to }) => {
            // todo: do proper args validation

            const stmt = database.prepare(
                `SELECT * FROM expenses WHERE date BETWEEN ? AND ?`
            );
            const rows = stmt.all(from, to);
            console.log('rows', rows);
            return JSON.stringify(rows);
        },
        {
            name: 'get_expenses',
            description:
                'Get the expenses from database for given date range',
            schema: z.object({
                from: z
                    .string()
                    .describe('Start date in YYYY-MM-DD format'),
                to: z
                    .string()
                    .describe('End date in YYYY-MM-DD format'),
            }),
        }
    );

    /**
     * Generate chart
     */

    const generateChart = tool(
        ({ from, to, groupBy }) => {
            console.log("args", { from, to, groupBy })
            // YYY-MM-DD -> month -> 2025-2-12 -> 2025-12

            let sqlGroupBy: string;

            switch (groupBy) {
                case "month":
                    sqlGroupBy = `strftime('%Y-%m',date)`;
                    break;
                
                case "week":
                    sqlGroupBy = `strftime('%Y-W%W',date)`;
                    break;
                
                case "date":
                    sqlGroupBy = `date`;
                    break;
                default:
                    sqlGroupBy = `strftime('%Y-%m',date)`;
            }


            
            const query = `
            SELECT  ${sqlGroupBy} as period, SUM(amount) as total
            FROM expenses
            WHERE date BETWEEN ? AND ?
            GROUP BY period
            ORDER BY period
            `
            const stmt = database.prepare(query);

            const rows = stmt.all(from, to);

            console.log(rows);

            return JSON.stringify(rows);
        },
        {
            name: 'generate_expense_chart',
            description:
                'Generate expense charts by querying the database and grouping expenses by month,week or date.',
            schema: z.object({
                from: z
                    .string()
                    .describe('Start date in YYYY-MM-DD format'),
                to: z
                    .string()
                    .describe('End date in YYYY-MM-DD format'),
                groupBy: z.enum(["month","week","date"]).describe("How to group the data: bymonth,week or date")
            }),
        }
    );

    return [addExpense, getExpenses,generateChart];

};




