#!/usr/bin/env bash
# Runs the database authorization tests against a throwaway local PostgreSQL.
#
#   sudo scripts/test-db.sh          # needs PostgreSQL server binaries (initdb, pg_ctl)
#
# It creates a fresh cluster, applies a minimal stand-in for Supabase's auth
# schema (supabase/tests/00_auth_stub.sql), applies every migration twice (to
# prove they are idempotent), runs supabase/tests/*_rls.sql, then deletes the
# cluster. Exits non-zero on the first failed assertion.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PGBIN="${PGBIN:-$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)}"
PORT="${PGTEST_PORT:-55439}"
RUN_AS="${PGTEST_USER:-postgres}"

if [[ -z "${PGBIN}" || ! -x "${PGBIN}/initdb" ]]; then
  echo "PostgreSQL server binaries not found. Set PGBIN=/path/to/postgresql/bin" >&2
  exit 2
fi

# The cluster and SQL files live somewhere the postgres user can read.
BASE="$(getent passwd "${RUN_AS}" | cut -d: -f6)/imela-test-$$"
as_pg() {
  if [[ "$(id -un)" == "${RUN_AS}" ]]; then bash -c "$1"; else su "${RUN_AS}" -s /bin/bash -c "$1"; fi
}

cleanup() {
  as_pg "${PGBIN}/pg_ctl -D '${BASE}/data' -m immediate stop >/dev/null 2>&1 || true"
  rm -rf "${BASE}"
}
trap cleanup EXIT

mkdir -p "${BASE}/sql/tests"
cp "${REPO}"/supabase/migrations/*.sql "${BASE}/sql/"
cp "${REPO}"/supabase/tests/*.sql "${BASE}/sql/tests/"
chown -R "${RUN_AS}" "${BASE}" 2>/dev/null || true

as_pg "${PGBIN}/initdb -D '${BASE}/data' -A trust >/dev/null"
as_pg "${PGBIN}/pg_ctl -D '${BASE}/data' -o '-p ${PORT} -k ${BASE}' -l '${BASE}/server.log' -w start >/dev/null"

PSQL="psql -X -q -t -A -h '${BASE}' -p ${PORT} -v ON_ERROR_STOP=1 -d postgres"

echo "→ auth stub"
as_pg "${PSQL} -f '${BASE}/sql/tests/00_auth_stub.sql'"

run_sql() { # file, label — prints output without NOTICE noise, fails on error
  local out rc
  set +e
  out="$(as_pg "${PSQL} -f '${BASE}/sql/$1'" 2>&1)"
  rc=$?
  set -e
  printf '%s\n' "${out}" | sed -E -e '/^$/d' -e 's/^psql:[^ ]+ NOTICE:  /  /' -e '/^NOTICE: /d' | grep -v -E '^  (relation|policy|trigger|function|schema|role|index|extension) .* (already exists|does not exist)' || true
  if [[ ${rc} -ne 0 ]]; then printf "%s\n" "${out}" | grep -E "ERROR|FAIL|CONTEXT" >&2 || true; echo "✗ $2 failed (exit ${rc})" >&2; exit ${rc}; fi
}

for pass in 1 2; do
  echo "→ migrations (pass ${pass})"
  for f in $(ls "${BASE}/sql" | grep -E '^[0-9]{14}_.*\.sql$' | sort); do
    run_sql "${f}" "${f} (pass ${pass})" >/dev/null
    echo "  ✓ ${f}"
  done
done

total=0
for t in $(ls "${BASE}/sql/tests" | grep -E '_rls\.sql$' | sort); do
  echo "→ ${t}"
  run_sql "tests/${t}" "${t}" > "${BASE}/${t}.out"   # exits the script on any failed assertion
  grep -E 'PASS|PASSED' "${BASE}/${t}.out" || true
  total=$((total + $(grep -c 'PASS ' "${BASE}/${t}.out" || true)))
done
echo "✓ database tests passed (${total} assertions)"
