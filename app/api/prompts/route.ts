import { NextResponse } from "next/server";
import { generateWritingPrompts } from "@/lib/prompts-service";

export async function POST() {
  try {
    const prompts = await generateWritingPrompts();
    return NextResponse.json({ prompts });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Prompt generation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
