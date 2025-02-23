
import { AnalysisResult } from "@/types/analysis";

const AnalysisSections = ({ data }: { data: AnalysisResult }) => {
  return (
    <div className="space-y-6">
      {data.sections.map((section, index) => (
        <div key={index} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-3">{section.title}</h3>
          <ul className="space-y-2 text-white/70">
            {section.content.map((item, itemIndex) => (
              <li key={itemIndex}>• {item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default AnalysisSections;
