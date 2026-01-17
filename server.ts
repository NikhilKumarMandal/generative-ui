import express from 'express';
import cors from 'cors';


const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.json({ message: 'OK' });
});

app.post('/chat', async (req, res) => {
    // SSE
    // 1. Add special header
    // 2. Send data in special format

    const { query } = req.body;

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
    });


    setInterval(() => {
      res.write('event: cgPing\n')
      res.write(`data: ${query}\n\n`)
    }, 1000)

    res.end();
});

const PORT = process.env.PORT || 4100;
app.listen(PORT, () =>
    console.log(
        `Server is running on http://localhost:${PORT}`
    )
);