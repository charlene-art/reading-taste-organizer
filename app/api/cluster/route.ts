import { NextResponse } from "next/server";
import { runClustering } from "@/lib/cluster-service";

export async function POST(request: Request) {
  let k: number | undefined;
  try {
    const body = (await request.json()) as { k?: number };
    if (typeof body.k === "number" && body.k >= 1 && body.k <= 20) {
      k = Math.floor(body.k);
    }
  } catch {
    /* empty body */
  }

  try {
    const payload = await runClustering(k);
    return NextResponse.json(payload);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Clustering failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
