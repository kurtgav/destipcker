import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // 1. Auth Check
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Get User Data
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

        if (userError || !userData) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 3. Check Usage Limits
        const today = new Date().toISOString().split("T")[0];

        // Handle Date Reset
        if (userData.last_reset_date !== today) {
            await supabase
                .from("users")
                .update({
                    daily_usage_count: 0,
                    daily_outfit_count: 0,
                    daily_menu_count: 0,
                    last_reset_date: today
                })
                .eq("id", user.id);
            userData.daily_outfit_count = 0;
        }

        if (!userData.is_premium && userData.daily_outfit_count >= 3) {
            return NextResponse.json(
                { error: "Daily limit reached", limit_reached: true },
                { status: 429 }
            );
        }

        // 4. Parse FormData
        const formData = await request.formData();
        const image1 = formData.get("image1") as File | null;
        const image2 = formData.get("image2") as File | null;
        const message = formData.get("message") as string | null;
        const historyStr = formData.get("history") as string | null;

        // Parse conversation history for context
        let conversationHistory: { role: string; content: string }[] = [];
        if (historyStr) {
            try {
                conversationHistory = JSON.parse(historyStr);
            } catch (e) {
                console.warn("Failed to parse conversation history");
            }
        }

        const hasImages = image1 && image2;
        const hasText = message && message.trim().length > 0;

        if (!hasImages && !hasText) {
            return NextResponse.json({ error: "Please provide images or a message" }, { status: 400 });
        }

        // 5. Process with Gemini
        let resultText = "";

        console.log("Step 5: Checking Gemini configuration");
        const { getGeminiModel, fileToGenerativePart } = await import("@/lib/gemini");
        const model = getGeminiModel();

        if (!model) {
            console.warn("Gemini API Key missing. Using mock response.");
            await new Promise(r => setTimeout(r, 1500));

            if (hasImages) {
                resultText = "I recommend **Outfit 1**! The color palette compliments your style better and the silhouette is more modern and versatile. (Note: Real AI requires GEMINI_API_KEY)";
            } else {
                resultText = `Great question! As your AI stylist, here's my advice: ${message}. For personalized recommendations, try uploading outfit photos! (Note: Real AI requires GEMINI_API_KEY)`;
            }
        } else {
            let prompt = "";
            const parts: any[] = [];

            // Build context from conversation history
            const historyContext = conversationHistory.length > 0
                ? `\n\nPrevious conversation:\n${conversationHistory.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n')}\n\n`
                : "";

            if (hasImages) {
                console.log("Processing images for Gemini");
                const imagePart1 = await fileToGenerativePart(image1);
                const imagePart2 = await fileToGenerativePart(image2);

                if (hasText) {
                    prompt = `You are a professional fashion stylist.${historyContext}The user has shared two outfit options and says: "${message}". Compare these outfits considering their request and our previous conversation context. Be helpful, friendly, and give specific advice. Address the user directly.`;
                } else {
                    prompt = `You are a professional fashion stylist.${historyContext}Compare these two outfits. Which one is better for a general social outing or date? Explain why briefly and choose a winner. Address the user directly.`;
                }

                parts.push(prompt, imagePart1, imagePart2);
            } else {
                // Text-only fashion question
                prompt = `You are a friendly, knowledgeable fashion stylist AI assistant.${historyContext}The user asks: "${message}". 
                
Provide helpful fashion advice. Be concise but thorough. If they're asking about specific clothing, colors, or styles, give practical recommendations. 
If they want outfit comparisons, suggest they upload photos. Address them directly and be encouraging!`;

                parts.push(prompt);
            }

            console.log("Sending request to Gemini");
            const result = await model.generateContent(parts);
            const response = await result.response;
            resultText = response.text();
            console.log("Gemini response received");
        }

        // 6. Increment Usage (only for image comparisons)
        if (!userData.is_premium && hasImages) {
            await supabase
                .from("users")
                .update({ daily_outfit_count: userData.daily_outfit_count + 1 })
                .eq("id", user.id);
        }

        // 7. Return Result
        return NextResponse.json({
            result: resultText
        });

    } catch (error: any) {
        console.error("Outfit API Error Full:", error);
        return NextResponse.json({
            error: error.message || "Internal Server Error",
            details: error.toString()
        }, { status: 500 });
    }
}

