import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
    const { message, history } = await req.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const chat = model.startChat({ history });

    const result = await chat.sendMessageStream(message);

    const encoder = new TextEncoder();

const stream = new ReadableStream({
  async start(controller) {
    let previous = '';

    for await (const chunk of result.stream) {
      const full = chunk.text();
      const delta = full.replace(previous, '');
      previous = full;
      controller.enqueue(encoder.encode(delta));
    }

    controller.close();
  },
});

    return new NextResponse(stream, {
        headers: { 'Content-Type': 'text/plain' },
    });
}
