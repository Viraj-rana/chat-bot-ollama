// const express = require('express');
// const cors = require('cors');
// const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// const app = express();
// const PORT = 3000;
// const OLLAMA_URL = 'http://127.0.0.1:11434';

// // Middleware
// app.use(cors()); // Allows your React app (localhost:5173) to talk to this server
// app.use(express.json());

// // 1. Health Check Endpoint
// // Checks if this server can talk to Ollama
// app.get('/api/health', async (req, res) => {
//   try {
//     const response = await fetch(`${OLLAMA_URL}/api/tags`);
//     if (response.ok) {
//       res.status(200).json({ status: 'connected', message: 'Connected to Ollama' });
//     } else {
//       res.status(502).json({ status: 'error', message: 'Ollama is running but returned an error' });
//     }
//   } catch (error) {
//     console.error('Ollama connection failed:', error);
//     res.status(503).json({ status: 'error', message: 'Could not connect to Ollama. Is it running?' });
//   }
// });

// // 2. Chat Proxy Endpoint
// // Receives request from React, forwards to Ollama, streams response back
// app.post('/api/chat', async (req, res) => {
//   try {
//     const ollamaResponse = await fetch(`${OLLAMA_URL}/api/chat`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(req.body),
//     });

//     if (!ollamaResponse.ok) {
//         const errorText = await ollamaResponse.text();
//         return res.status(ollamaResponse.status).send(errorText);
//     }

//     // Set headers for streaming
//     res.setHeader('Content-Type', 'text/plain; charset=utf-8');
//     res.setHeader('Transfer-Encoding', 'chunked');

//     // Pipe the Ollama stream directly to the React client
//     if (ollamaResponse.body) {
//         // Node-fetch returns a NodeJS stream, we can pipe it
//         ollamaResponse.body.pipe(res);
//     } else {
//         res.end();
//     }

//   } catch (error) {
//     console.error('Proxy Error:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`\n🚀 Backend Proxy running at http://localhost:${PORT}`);
//   console.log(`Qt talking to Ollama at ${OLLAMA_URL}`);
// });


import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3000;
const OLLAMA_URL = 'http://127.0.0.1:11434';

// Middleware
app.use(cors()); // Allows your React app (localhost:5173) to talk to this server
app.use(express.json());

// 1. Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    if (response.ok) {
      res.status(200).json({ status: 'connected', message: 'Connected to Ollama' });
    } else {
      res.status(502).json({ status: 'error', message: 'Ollama is running but returned an error' });
    }
  } catch (error) {
    console.error('Ollama connection failed:', error);
    res.status(503).json({ status: 'error', message: 'Could not connect to Ollama. Is it running?' });
  }
});

// 2. Chat Proxy Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const ollamaResponse = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    if (!ollamaResponse.ok) {
        const errorText = await ollamaResponse.text();
        return res.status(ollamaResponse.status).send(errorText);
    }

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Pipe the Ollama stream directly to the React client
    if (ollamaResponse.body) {
        ollamaResponse.body.pipe(res);
    } else {
        res.end();
    }

  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Backend Proxy running at http://localhost:${PORT}`);
  console.log(`Qt talking to Ollama at ${OLLAMA_URL}`);
});