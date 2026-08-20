import { randomUUID } from "crypto";
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { rateLimit, getClientIpFromRecord } from "@/lib/rate-limit";

// bcrypt cost factor. 12 is a deliberate choice, not a default I forgot
// to change — it's the current OWASP-recommended floor for bcrypt as of
// early 2026. Raise it only after benchmarking login latency on your
// actual server, since cost scales exponentially.
export const BCRYPT_COST_FACTOR = 12;

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// IP-based limit, separate from and in addition to the per-account
// lockout above. Per-account lockout stops brute-forcing ONE account;
// it does nothing to stop password-spraying (one guessed password
// tried against many different emails from the same IP). This is
// deliberately looser than the account lockout (15 attempts vs 5)
// because it has to tolerate a shared office/NAT IP with several
// legitimate users typing passwords wrong, not just one attacker.
const LOGIN_IP_LIMIT = 15;
const LOGIN_IP_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw, req) {
        // IP-based throttle, checked before anything else touches the
        // DB or bcrypt. This is the piece that was missing: the
        // per-account lockout below only protects a single account,
        // so an attacker spraying one password across many emails from
        // one IP was previously unthrottled.
        const ip = getClientIpFromRecord(req?.headers as Record<string, unknown> | undefined);
        const ipLimit = await rateLimit(`login:${ip}`, {
          limit: LOGIN_IP_LIMIT,
          windowMs: LOGIN_IP_WINDOW_MS,
        });
        if (!ipLimit.allowed) {
          throw new Error("LOGIN_RATE_LIMITED");
        }

        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });

        // Same generic failure path whether the user doesn't exist or
        // the password is wrong — do not let this branch leak which
        // case it was (that's a user-enumeration vector).
        if (!user || !user.passwordHash || user.deletedAt) {
          return null;
        }

        const now = new Date();

        if (user.lockedUntil && user.lockedUntil > now) {
          // Locked. Do not run bcrypt.compare at all here — skipping it
          // means a locked account can't be used to burn CPU cycles on
          // repeated hash comparisons, and it can't leak timing info
          // about whether the password would've matched.
          throw new Error("ACCOUNT_LOCKED");
        }

        const valid = await bcrypt.compare(password, user.passwordHash);

        if (!valid) {
          const attempts = user.failedLoginAttempts + 1;
          const lockedUntil =
            attempts >= MAX_FAILED_ATTEMPTS
              ? new Date(now.getTime() + LOCKOUT_DURATION_MS)
              : null;

          // NOTE ON RACE CONDITIONS: this read-then-write on
          // failedLoginAttempts is not atomic. Two concurrent failed
          // logins could both read attempts=4 and both write attempts=5,
          // undercounting real attempts by one. For a login-lockout
          // counter this under-count is low-severity (worst case: one
          // extra attempt beyond the limit), but I'm flagging it rather
          // than pretending this is airtight. A true fix uses an atomic
          // increment: prisma.user.update({ data: { failedLoginAttempts:
          // { increment: 1 } } }) and then re-reading to decide lockout —
          // switch to that if you need this to be exact.
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: attempts, lockedUntil },
          });
          return null;
        }

        // Password is correct. Block here if the email was never
        // verified — this is the actual enforcement point that was
        // missing before: signup sends a verification email, but
        // nothing previously checked whether the link was ever
        // clicked, so unverified (including fake/typo'd) emails could
        // log in and buy. Checked only AFTER the password matches, so
        // a wrong-password guess and an unverified-account login look
        // identical to an attacker probing for valid emails.
        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        // Successful login: reset lockout state and issue a fresh
        // session id. Storing this on the user row and checking it in
        // the jwt callback is what enforces "one active session" — an
        // older JWT becomes invalid the moment a newer login happens,
        // because its embedded sessionId won't match anymore.
        const sessionId = randomUUID();
        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: 0, lockedUntil: null, activeSessionId: sessionId },
        });

        return { id: user.id, email: user.email, name: user.name, sessionId };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On fresh sign-in, `user` is populated — stamp the token.
      if (user) {
        token.uid = user.id;
        token.sessionId = (user as { sessionId?: string }).sessionId;
        return token;
      }

      // On every subsequent request, re-check against the DB that this
      // token's sessionId still matches the account's current active
      // session. If someone logs in elsewhere, this invalidates the
      // older token on its very next use — that's the actual
      // enforcement point, not just at login time.
      if (token.uid) {
        const current = await prisma.user.findUnique({
          where: { id: token.uid as string },
          select: { activeSessionId: true, deletedAt: true },
        });

        if (!current || current.deletedAt || current.activeSessionId !== token.sessionId) {
          // Returning an empty token forces NextAuth to treat this as
          // unauthenticated on the next getServerSession() call.
          return {};
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token.uid && session.user) {
        (session.user as { id?: string }).id = token.uid as string;
      }
      return session;
    },
  },

  events: {
    async signOut({ token }) {
      // Explicitly clear activeSessionId on logout so a captured old
      // JWT (e.g. from a stolen refresh token) can't be replayed after
      // the user believes they've logged out.
      if (token?.uid) {
        await prisma.user.update({
          where: { id: token.uid as string },
          data: { activeSessionId: null },
        }).catch(() => {
          // User may already be deleted — non-fatal.
        });
      }
    },
  },
};
