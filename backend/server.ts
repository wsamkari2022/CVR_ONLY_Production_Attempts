// server.ts
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/ExplicitValue', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
} as any)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB error:', err));

// Define schemas and models
const deepValuesSchema = new mongoose.Schema({
    deepValues: [
        new mongoose.Schema(
            {
                name: String,
                type: String,
            },
            { _id: false }
        ),
    ],
});

const explicitValuesSchema = new mongoose.Schema({
    explicitValues: [
        new mongoose.Schema(
            {
                question_id: Number,
                value_selected: String,
                timestamp: String,
            },
            { _id: false }
        ),
    ],
});

const DeepValuesCollection = mongoose.model('DeepValuesCollection', deepValuesSchema);
const ExplicitValuesCollection = mongoose.model('ExplicitValuesCollection', explicitValuesSchema);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// API route to receive deep values
app.post('/api/deep-values', async (req, res) => {
    try {
        console.log('📥 Received deep values:', req.body);
        await DeepValuesCollection.deleteMany();
        const saved = await DeepValuesCollection.create(req.body);
        res.json({ message: 'Deep values saved', saved });
    } catch (error) {
        console.error('❌ Error saving deep values:', error);
        res.status(500).json({ message: 'Failed to save deep values', error });
    }
});

// API route to receive explicit values
app.post('/api/explicit-values', async (req, res) => {
    try {
        console.log('📥 Received explicit values:', req.body);
        await ExplicitValuesCollection.deleteMany();
        const saved = await ExplicitValuesCollection.create(req.body);
        res.json({ message: 'Explicit values saved', saved });
    } catch (error) {
        console.error('❌ Error saving explicit values:', error);
        res.status(500).json({ message: 'Failed to save explicit values', error });
    }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));