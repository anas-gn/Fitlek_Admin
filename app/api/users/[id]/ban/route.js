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

  if (String(session.id) === String(id)) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas bannir votre propre compte." },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const banType = body?.banType === "permanent" ? "permanent" : "temporary";
    const reason = (body?.reason || "").trim();
    const durationDays = Number(body?.durationDays) || 7;

    if (!reason) {
      return NextResponse.json({ error: "Le motif du bannissement est requis." }, { status: 400 });
    }

    const users = await query(`SELECT id, role FROM users WHERE id = ?`, [id]);
    if (!users[0]) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }
    if (users[0].role === "admin") {
      return NextResponse.json({ error: "Impossible de bannir un compte admin." }, { status: 400 });
    }

    // Lift any existing active ban before creating a new one
    await query(
      `UPDATE bans SET isActive = 0, liftedAt = NOW(), liftedBy = ? WHERE userID = ? AND isActive = 1`,
      [session.id, id]
    );

    const expiresAt =
      banType === "permanent"
        ? null
        : new Date(Date.now() + durationDays * 24 * 3600 * 1000)
            .toISOString()
            .slice(0, 19)
            .replace("T", " ");

    await query(
      `INSERT INTO bans (userID, bannedBy, banType, reason, bannedAt, expiresAt, isActive)
       VALUES (?, ?, ?, ?, NOW(), ?, 1)`,
      [id, session.id, banType, reason, expiresAt]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erreur serveur lors du bannissement." },
      { status: 500 }
    );
  }
}
