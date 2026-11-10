import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PageHeader({ title, description, actionLabel, onAction, to }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {actionLabel && to && (
        <Button asChild>
          <Link to={to}>{actionLabel}</Link>
        </Button>
      )}
      {actionLabel && onAction && !to && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}