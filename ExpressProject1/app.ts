import express from 'express';
import * as path from 'path';
import * as fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const dbFilePath = path.join(__dirname, 'db.json');

interface Submission {
    name: string;
    email: string;
    phone: string;
    github_link: string;
    stopwatch_time: string;
}

interface Database {
    submissions: Submission[];
}

if (!fs.existsSync(dbFilePath)) {
    const initialData: Database = { submissions: [] };
    fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2));
}

app.get('/ping', (req, res) => {
    res.json({ success: true });
});

app.post('/submit', (req, res) => {
    const { name, email, phone, github_link, stopwatch_time } = req.body;

    if (!name || !email || !phone || !github_link || !stopwatch_time) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const rawData = fs.readFileSync(dbFilePath);
    const database: Database = JSON.parse(rawData.toString());

    const newSubmission: Submission = { name, email, phone, github_link, stopwatch_time };
    database.submissions.push(newSubmission);

    fs.writeFileSync(dbFilePath, JSON.stringify(database, null, 2));

    res.json({ success: true });
});

app.get('/read', (req, res) => {
    const { index } = req.query;
    const idx = Number(index);

    if (isNaN(idx)) {
        return res.status(400).json({ error: 'Invalid index' });
    }

    const rawData = fs.readFileSync(dbFilePath);
    const database: Database = JSON.parse(rawData.toString());

    if (idx < 0 || idx >= database.submissions.length) {
        return res.status(404).json({ error: 'Submission not found' });
    }

    const submission = database.submissions[idx];
    res.json(submission);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

