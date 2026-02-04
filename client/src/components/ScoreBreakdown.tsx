import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ScoreBreakdownProps {
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  cultureScore: number;
  skillsContribution: number;
  experienceContribution: number;
  educationContribution: number;
  cultureContribution: number;
}

export function ScoreBreakdown({
  skillsScore,
  experienceScore,
  educationScore,
  cultureScore,
  skillsContribution,
  experienceContribution,
  educationContribution,
  cultureContribution,
}: ScoreBreakdownProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle>Multi-Agent Score Breakdown</CardTitle>
        <CardDescription>Individual agent evaluations and their contribution to overall score</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Skills Agent */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">Skills Evaluation</p>
              <p className="text-xs text-muted-foreground">Technical skills match (40% weight)</p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${getScoreColor(skillsScore)}`}>{Math.round(skillsScore)}</p>
              <p className="text-xs text-muted-foreground">+{skillsContribution} to overall</p>
            </div>
          </div>
          <Progress value={skillsScore} className="h-2" />
        </div>

        {/* Experience Agent */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">Experience Evaluation</p>
              <p className="text-xs text-muted-foreground">Professional background match (35% weight)</p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${getScoreColor(experienceScore)}`}>{Math.round(experienceScore)}</p>
              <p className="text-xs text-muted-foreground">+{experienceContribution} to overall</p>
            </div>
          </div>
          <Progress value={experienceScore} className="h-2" />
        </div>

        {/* Education Agent */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">Education Evaluation</p>
              <p className="text-xs text-muted-foreground">Degree and certifications (15% weight)</p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${getScoreColor(educationScore)}`}>{Math.round(educationScore)}</p>
              <p className="text-xs text-muted-foreground">+{educationContribution} to overall</p>
            </div>
          </div>
          <Progress value={educationScore} className="h-2" />
        </div>

        {/* Culture Agent */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">Culture Fit Evaluation</p>
              <p className="text-xs text-muted-foreground">Soft skills and cultural alignment (10% weight)</p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${getScoreColor(cultureScore)}`}>{Math.round(cultureScore)}</p>
              <p className="text-xs text-muted-foreground">+{cultureContribution} to overall</p>
            </div>
          </div>
          <Progress value={cultureScore} className="h-2" />
        </div>

        {/* Summary */}
        <div className="border-t border-border pt-4 mt-4">
          <p className="text-sm text-muted-foreground mb-2">Score Composition</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground">Skills:</span>
              <span className="font-semibold">{skillsContribution}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground">Experience:</span>
              <span className="font-semibold">{experienceContribution}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground">Education:</span>
              <span className="font-semibold">{educationContribution}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground">Culture:</span>
              <span className="font-semibold">{cultureContribution}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
