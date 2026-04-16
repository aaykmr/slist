"use client";

import type { CandidateRow } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  rows: CandidateRow[];
  loading: boolean;
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (p: number) => void;
};

export function CandidateTable({
  rows,
  loading,
  page,
  total,
  pageSize,
  onPageChange,
}: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Seniority</TableHead>
              <TableHead>Profiles</TableHead>
              <TableHead>Skills</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="p-4 text-muted-foreground">
                Loading…
                </TableCell>
              </TableRow>
          ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="p-4 text-muted-foreground">
                No candidates match these filters.
                </TableCell>
              </TableRow>
          ) : (
            rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="align-top">
                  <Link href={`/candidates/${r.id}`}>
                    {r.displayName ?? r.email ?? r.id.slice(0, 8)}
                  </Link>
                  {r.email ? (
                      <div className="text-xs text-muted-foreground">
                      {r.email}
                    </div>
                  ) : null}
                  </TableCell>
                  <TableCell className="align-top">
                  {r.primaryRole ?? "—"}
                  </TableCell>
                  <TableCell className="align-top">
                  {r.seniority ?? "—"}
                  {r.yearsExperience != null ? (
                      <div className="text-xs text-muted-foreground">
                      ~{r.yearsExperience} yrs
                    </div>
                  ) : null}
                  </TableCell>
                  <TableCell className="max-w-52 align-top">
                  {r.jobProfiles.map((p) => p.label).join(", ") || "—"}
                  </TableCell>
                  <TableCell className="max-w-72 align-top">
                  {r.skills.map((s) => s.label).join(", ") || "—"}
                  </TableCell>
                </TableRow>
            ))
          )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t px-3 py-2 text-sm text-muted-foreground">
          <span>
          {total} total · page {page} of {pages}
          </span>
          <span className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
            Prev
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= pages}
              onClick={() => onPageChange(page + 1)}
            >
            Next
            </Button>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
