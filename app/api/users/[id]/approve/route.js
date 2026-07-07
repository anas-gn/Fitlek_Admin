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
  let approve = true;
  try {
    const body = await request.json();
    if (typeof body?.approve === "boolean") approve = body.approve;
  } catch (e) {
    // no body sent -> default to approving
  }

  try {
    const users = await query(`SELECT id, role FROM users WHERE id = ?`, [id]);
    if (!users[0]) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    await query(`UPDATE users SET isApproved = ? WHERE id = ?`, [approve ? 1 : 0, id]);

    return NextResponse.json({ ok: true, isApproved: approve });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erreur serveur lors de la mise à jour de l'approbation." },
      { status: 500 }
    );
  }
}
