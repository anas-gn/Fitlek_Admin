import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";
import { requireAdmin } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  const session = requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const id = params.id;

  try {
    const users = await query(`SELECT * FROM users WHERE id = ?`, [id]);
    const user = users[0];
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }
    delete user.passwordHash;

    const [coachProfile, advisorProfile, bans, reservationsAsClient, reservationsAsCoach] =
      await Promise.all([
        query(`SELECT * FROM coachprofiles WHERE userID = ?`, [id]),
        query(`SELECT * FROM advisorprofiles WHERE userID = ?`, [id]),
        query(
          `SELECT * FROM bans WHERE userID = ? ORDER BY bannedAt DESC`,
          [id]
        ),
        query(
          `SELECT id, coachID, reservedDate, reservedTime, status, price, companyName, createdAt
           FROM reservations WHERE clientID = ? ORDER BY reservedDate DESC LIMIT 20`,
          [id]
        ),
        query(
          `SELECT id, clientID, reservedDate, reservedTime, status, price, companyName, createdAt
           FROM reservations WHERE coachID = ? ORDER BY reservedDate DESC LIMIT 20`,
          [id]
        )
      ]);

    return NextResponse.json({
      user,
      coachProfile: coachProfile[0] || null,
      advisorProfile: advisorProfile[0] || null,
      bans,
      reservationsAsClient,
      reservationsAsCoach
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erreur serveur lors du chargement de l'utilisateur." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const session = requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const id = params.id;

  if (String(session.id) === String(id)) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas supprimer votre propre compte admin." },
      { status: 400 }
    );
  }

  try {
    const users = await query(`SELECT role FROM users WHERE id = ?`, [id]);
    if (!users[0]) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }
    if (users[0].role === "admin") {
      return NextResponse.json(
        { error: "Suppression des comptes admin non autorisée depuis cette interface." },
        { status: 400 }
      );
    }

    await query(`DELETE FROM users WHERE id = ?`, [id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erreur serveur lors de la suppression." },
      { status: 500 }
    );
  }
}
