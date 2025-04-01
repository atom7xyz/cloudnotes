import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  description?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  description,
  subtitle,
  children,
  footer,
  className = "",
}: AuthCardProps) {
  return (
    <Card className={cn(
      "w-full max-w-4xl shadow-xl bg-background rounded-none border-none overflow-hidden",
      className
    )}>
      <CardHeader className="space-y-3 text-center px-10">
        <CardTitle className="text-5xl font-extrabold italic mb-0 font-bigshot-one select-none">{title}</CardTitle>
        {description && (
          <CardDescription className="text-sm italic select-none">{description}</CardDescription>
        )}
        {description && <Separator className="mt-4 mb-1" />}
        {subtitle && (
          <div className="text-xl font-semibold text-foreground pt-4 select-none">{subtitle}</div>
        )}
      </CardHeader>
      <CardContent className="px-10">{children}</CardContent>
      {footer && <CardFooter className="px-10 py-3 !pt-0 border-t border-border/30 select-none">{footer}</CardFooter>}
    </Card>
  );
} 