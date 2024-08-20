const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;


app.use(express.json());

const WINDOW_SIZE = 10;
let numbersWindow = [];

const fetchNumbers = async (type) => {
    let url;
    switch (type) {
        case 'p':
            url = 'http://20.244.56.144/test/primes';
            break;
        case 'f':
            url = 'http://20.244.56.144/test/fibo';
            break;
        case 'e':
            url = 'http://20.244.56.144/test/even';
            break;
        case 'r':
            url = 'http://20.244.56.144/test/rand';
            break;
        default:
            throw new Error('Invalid number type');
    }

    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
            },
        });
        return response.data.numbers;
    } catch (error) {
        console.error('Error fetching numbers:', error);
        return [];
    }
};

const calculateAverage = (numbers) => {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return (sum / numbers.length).toFixed(2);
};

app.get('/numbers/:numberid', async (req, res) => {
    const { numberid } = req.params;
    const newNumbers = await fetchNumbers(numberid);

    const uniqueNumbers = [...new Set(newNumbers)];

    const prevWindowState = [...numbersWindow];
    numbersWindow.push(...uniqueNumbers);

    if (numbersWindow.length > WINDOW_SIZE) {
        numbersWindow = numbersWindow.slice(-WINDOW_SIZE);
    }

    const avg = calculateAverage(numbersWindow);

    res.json({
        windowPrevState: prevWindowState,
        windowCurrState: numbersWindow,
        numbers: uniqueNumbers,
        avg: parseFloat(avg),
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
