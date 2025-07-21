import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface RoleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  onSelect: () => void;
  gradient?: string;
}

export function RoleCard({ title, description, icon: Icon, features, onSelect, gradient = "bg-gradient-medical" }: RoleCardProps) {
  return (
    <Card className="group transition-all duration-300 hover:scale-105 hover:shadow-elevated">
      <CardHeader>
        <div className={`w-16 h-16 rounded-full ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="text-sm text-muted-foreground flex items-center">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
              {feature}
            </li>
          ))}
        </ul>
        <Button 
          onClick={onSelect} 
          className="w-full" 
          variant="medical"
        >
          {title} Olarak Giriş Yap
        </Button>
      </CardContent>
    </Card>
  );
}