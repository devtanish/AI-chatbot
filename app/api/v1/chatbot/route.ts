import { NextRequest, NextResponse } from "next/server";
import { OpenRouter } from '@openrouter/sdk';

export async function GET(request: NextRequest) {
    const message = request.nextUrl.searchParams.get('message');

    console.log("Received message:", message);

    if (!message) {
        return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const openRouter = new OpenRouter({
        apiKey: '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',
    });

    const completion = await openRouter.chat.send({
        model: 'google/gemma-3-27b-it:free',
        messages: [
            {
                role: 'user',
                content: message,
            },
        ],
        stream: false,
    });

    console.log(completion.choices[0].message?.content);

    return NextResponse.json({ 
        message: completion.choices[0].message?.content || "No response from model." 
    });
}