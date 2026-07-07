import { NextResponse } from "next/server";
import { query } from "../../../../../lib/db";
import { requireAdmin } from "../../../../../lib/auth";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  const session = requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const id = params.id;

  try {
    await query(
      `UPDATE bans SET isActive = 0, liftedAt = NOW(), liftedBy = ? WHERE userID = ? AND isActive = 1`,
      [session.id, id]
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erreur serveur lors de la levée du bannissement." },
      { status: 500 }
    );
  }
}
