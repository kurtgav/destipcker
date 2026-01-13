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
            userData.daily_menu_count = 0;
        }

        if (!userData.is_premium && userData.daily_menu_count >= 3) {
            return NextResponse.json(
                { error: "Daily limit reached", limit_reached: true },
                { status: 429 }
            );
        }

        // 4. Parse FormData
        const formData = await request.formData();
        const image = formData.get("image") as File | null;
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

        const hasImage = !!image;
        const hasText = message && message.trim().length > 0;

        if (!hasImage && !hasText) {
            return NextResponse.json({ error: "Please provide an image or a message" }, { status: 400 });
        }

        // 5. Process with Gemini
        let resultText = "";

        const { model, fileToGenerativePart } = await import("@/lib/gemini");

        if (!model) {
            console.warn("Gemini API Key missing. Using mock response.");
            await new Promise(r => setTimeout(r, 1500));

            if (hasImage) {
                resultText = "Based on this menu, the **Truffle Mushroom Risotto** is the standout dish. It's often a chef's specialty and reviews suggest it's a must-try here! (Note: Real AI requires GEMINI_API_KEY)";
            } else {
                resultText = `Great food question! Here's my take: ${message}. For menu-specific recommendations, try uploading a photo of the menu! (Note: Real AI requires GEMINI_API_KEY)`;
            }
        } else {
            let prompt = "";
            const parts: any[] = [];

            // Build context from conversation history
            const historyContext = conversationHistory.length > 0
                ? `\n\nPrevious conversation:\n${conversationHistory.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n')}\n\n`
                : "";

            if (hasImage) {
                const imagePart = await fileToGenerativePart(image);

                if (hasText) {
                    prompt = `You are a friendly food expert and restaurant guide.${historyContext}The user has shared a menu photo and says: "${message}". Analyze the menu considering their request and our previous conversation context. Be helpful, specific, and enthusiastic about food. Address the user directly.`;
                } else {
                    prompt = `You are a friendly food expert and restaurant guide.${historyContext}Analyze this restaurant menu. Identify the most unique or highly-likely-to-be-best dish based on descriptions, pricing, and layout. Recommend just one top choice and explain why briefly. Be enthusiastic and address the user directly.`;
                }

                parts.push(prompt, imagePart);
            } else {
                // Text-only food question
                prompt = `You are a friendly, knowledgeable food expert AI assistant.${historyContext}The user asks: "${message}". 
                
Provide helpful food advice. Be concise but thorough. If they're asking about dishes, cuisines, dietary preferences, or restaurant recommendations, give practical suggestions. 
If they want menu analysis, suggest they upload a menu photo. Address them directly and be enthusiastic about food!`;

                parts.push(prompt);
            }

            const result = await model.generateContent(parts);
            const response = await result.response;
            resultText = response.text();
        }

        // 6. Increment Usage (only for image scans)
        if (!userData.is_premium && hasImage) {
            await supabase
                .from("users")
                .update({ daily_menu_count: userData.daily_menu_count + 1 })
                .eq("id", user.id);
        }

        // 7. Return Result
        return NextResponse.json({
            result: resultText
        });

    } catch (error: any) {
        console.error("Menu API Error Full:", error);
        return NextResponse.json({
            error: error.message || "Internal Server Error",
            details: error.toString()
        }, { status: 500 });
    }
}
