# Security Notes

## Known Vulnerabilities (Accepted)

We are currently running `next-auth@4.24.15` on Node 20.20.2 (MacBook Air 2016 cannot upgrade).

### Known CVEs:
1. **Email normalizer homoglyph bypass** (GHSA-7rqj-j65f-68wh)
   - Risk: Low in practice; requires attacker to register lookalike email
   - Mitigation: Domain verification + monitoring for suspicious registrations

2. **Malformed Bearer header exception** (GHSA-xmf8-cvqr-rfgj)
   - Risk: Low; only affects OAuth flows with malformed headers
   - Mitigation: Already handled by error boundaries

3. **OAuth state/nonce binding** (GHSA-x445-f3h2-j279)
   - Risk: Low for single-provider setups
   - Mitigation: Using credentials provider primarily

### Plan:
- Upgrade Node to 22+ when hardware allows
- Migrate to `next-auth@5` when stable
- Reassess in Q[X]

See `npm audit` for full details.
