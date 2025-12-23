import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export function ActionCard({ title, description, href, icon }: {
  title: string; 
  description: string; 
  href: string; 
  icon?: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <Card className="rounded-2xl hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <div className="font-medium">{title}</div>
              <div className="text-sm text-muted-foreground">{description}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
