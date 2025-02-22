
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalysisCardProps {
  title: string;
  children: React.ReactNode;
}

const AnalysisCard = ({ title, children }: AnalysisCardProps) => {
  return (
    <Card className="bg-[#221F26]/50 backdrop-blur-xl border border-[#9b87f5]/20 rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-[#9b87f5]">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default AnalysisCard;
