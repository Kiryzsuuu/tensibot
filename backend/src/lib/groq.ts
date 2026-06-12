import Groq from 'groq-sdk';

let _groq: Groq | null = null;

export function getGroqClient(): Groq {
  if (!_groq) {
    const apiKey = process.env['GROQ_API_KEY'];
    if (!apiKey) throw new Error('GROQ_API_KEY environment variable is required');
    _groq = new Groq({ apiKey });
  }
  return _groq;
}

export const GROQ_MODEL = process.env['GROQ_MODEL'] ?? 'llama-3.1-8b-instant';
