
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalysisCardProps {
  title: string;
  children: React.ReactNode;
}

const AnalysisCard = ({ title, children }: AnalysisCardProps) => {
  return (
    <Card className="bg-black/30 rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg font-medium bg-gradient-to-r from-[#ff4d4d] to-[#ff0000] bg-clip-text text-transparent">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default AnalysisCard;
