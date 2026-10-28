#!/usr/bin/env bash
# Regenerates supabase/apply_all.sql from supabase/migrations/*.sql (in order).
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
files=$(ls supabase/migrations/*.sql | sort)
first=$(basename "$(echo "$files" | head -1)" | cut -c11-14)
last=$(basename "$(echo "$files" | tail -1)" | cut -c11-14)
{
  echo "-- ====================================================================="
  echo "-- Imela Ventures — all migrations combined, in order (${first} → ${last})."
  echo "-- GENERATED from supabase/migrations/*.sql. Edit those files, not this one."
  echo "-- Paste into Supabase Dashboard → SQL Editor and click Run."
  echo "-- Safe to re-run: every statement is idempotent and nothing is deleted."
  echo "-- ====================================================================="
  for f in $files; do
    printf '\n\n-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n-- %s\n-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n\n' "$(basename "$f")"
    cat "$f"
  done
} > supabase/apply_all.sql
echo "wrote supabase/apply_all.sql"
