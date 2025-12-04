import { Message, OllamaResponse } from '../types';
import { SYSTEM_PROMPT } from '../data/knowledgeBase';

// Now points to our own backend proxy, not Ollama directly
const API_URL = 'http://localhost:3000';

export const checkOllamaConnection = async (): Promise<boolean> => {
  try {
    // We hit our own health check endpoint
    const response = await fetch(`${API_URL}/api/health`);
    return response.ok;
  } catch (error) {
    console.error("Backend connection check failed:", error);
    return false;
  }
};

export const sendMessageToOllama = async (
  messages: Message[], 
  onChunk: (chunk: string) => void
): Promise<void> => {
  
  const payload = {
    model: 'mistral',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ],
    stream: true, 
    options: {
        temperature: 0.1,
    }
  };

  try {
    // We send the request to OUR server
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 503) {
             throw new Error("Сервер не видит Ollama. Убедитесь, что Ollama запущена.");
        }
        if (response.status === 404) {
             throw new Error("Модель 'mistral' не найдена. Выполните 'ollama pull mistral'.");
        }
        throw new Error(`Ошибка сервера: ${response.status} ${errorText}`);
    }

    if (!response.body) {
      throw new Error("ReadableStream not supported.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      
      if (value) {
        const chunkValue = decoder.decode(value, { stream: true });
        
        // The backend pipes the raw stream from Ollama.
        // Ollama sends JSON objects, sometimes multiple per line.
        const lines = chunkValue.split('\n');
        
        for (const line of lines) {
            if (!line.trim()) continue;
            try {
                const json: OllamaResponse = JSON.parse(line);
                if (json.message && json.message.content) {
                    onChunk(json.message.content);
                }
                if (json.done) {
                    done = true;
                }
            } catch (e) {
                // Sometimes a chunk might be partial JSON, in a robust app we buffer this.
                // For this prototype, we log warning.
                // console.warn("Error parsing JSON chunk", e); 
            }
        }
      }
    }

  } catch (error) {
    console.error("Error sending message:", error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error("Не удалось связаться с сервером (port 3000). Запустите 'node server.js'.");
    }
    throw error;
  }
};