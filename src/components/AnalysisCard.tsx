
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalysisCardProps {
  title: string;
  children: React.ReactNode;
}

const AnalysisCard = ({ title, children }: AnalysisCardProps) => {
  return (
    <Card className="glass-panel border-theme-red/20">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-theme-red">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default AnalysisCard;
