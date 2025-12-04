export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isOpen: boolean;
  error: string | null;
}
