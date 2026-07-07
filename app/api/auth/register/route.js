import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "../../../../lib/db";
import { requireAdmin } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  const session = requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const firstName = (body?.firstName || "").trim();
    const lastName = (body?.lastName || "").trim();
    const email = (body?.email || "").trim().toLowerCase();
    const password = body?.password || "";
    const gender = ["Male", "Female", "Other"].includes(body?.gender) ? body.gender : "Other";

    if (!firstName || !lastName) {
      return NextResponse.json({ error: "Prénom et nom sont requis." }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères." },
        { status: 400 }
      );
    }

    const existing = await query(`SELECT id FROM users WHERE email = ? LIMIT 1`, [email]);
    if (existing.length) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cette adresse e-mail." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO users (firstName, lastName, email, passwordHash, role, gender, isPremium, isApproved)
       VALUES (?, ?, ?, ?, 'admin', ?, 0, 1)`,
      [firstName, lastName, email, passwordHash, gender]
    );

    return NextResponse.json({ ok: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erreur serveur lors de la création du compte admin." },
      { status: 500 }
    );
  }
}
