import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "../../../../lib/db";
import { signSession, SESSION_COOKIE } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis." },
        { status: 400 }
      );
    }

    const rows = await query(
      `SELECT id, firstName, lastName, email, passwordHash, role
       FROM users WHERE email = ? AND role = 'admin' LIMIT 1`,
      [email]
    );

    const admin = rows[0];
    if (!admin) {
      return NextResponse.json(
        { error: "Identifiants invalides." },
        { status: 401 }
      );
    }

    let passwordOk = false;
    try {
      passwordOk = await bcrypt.compare(password, admin.passwordHash);
    } catch (e) {
      passwordOk = false;
    }

    if (!passwordOk) {
      return NextResponse.json(
        { error: "Identifiants invalides." },
        { status: 401 }
      );
    }

    const token = signSession({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      name: `${admin.firstName} ${admin.lastName}`.trim()
    });

    const hours = Number(process.env.SESSION_HOURS || 12);
    const res = NextResponse.json({
      ok: true,
      admin: { id: admin.id, email: admin.email, name: `${admin.firstName} ${admin.lastName}`.trim() }
    });

    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: hours * 3600
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erreur serveur lors de la connexion." },
      { status: 500 }
    );
  }
}
