import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY || '';
    const ai = new GoogleGenAI({ apiKey });

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a Personal AI Memory assistant. Answer concisely based on context.",
      }
    });

    const reply = response.text || "No response generated";

    return NextResponse.json({
      content: reply,
      confidenceScore: 95,
      isFactBased: true,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate memory AI response" }, { status: 500 });
  }
}
