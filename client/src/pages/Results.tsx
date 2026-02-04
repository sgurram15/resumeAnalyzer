import { useParams } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Share2, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function Results() {
  const { screeningId } = useParams<{ screeningId: string }>();
  const { user } = useAuth();
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);

  const screeningQuery = trpc.screening.getById.useQuery(
    { screeningId: parseInt(screeningId || "0") },
    { enabled: !!screeningId }
  );

  const resumesQuery = trpc.screening.getResumes.useQuery(
    { screeningId: parseInt(screeningId || "0") },
    { enabled: !!screeningId }
  );

  const scoresQuery = trpc.screening.getCandidateScores.useQuery(
    { screeningId: parseInt(screeningId || "0") },
    { enabled: !!screeningId }
  );

  if (screeningQuery.isLoading || resumesQuery.isLoading || scoresQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-foreground">Loading screening results...</p>
        </div>
      </div>
    );
  }

  if (screeningQuery.isError || !screeningQuery.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Failed to load screening results.</p>
            <a href="/">
              <Button className="w-full">Go Back</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const screening = screeningQuery.data;
  const resumes = resumesQuery.data || [];
  const scores = scoresQuery.data || [];

  const getScoreBadgeClass = (score: number) => {
    if (score >= 80) return "badge-score-high";
    if (score >= 60) return "badge-score-medium";
    return "badge-score-low";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-700";
    if (score >= 60) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const handleExportPDF = () => {
    toast.success("PDF export feature coming soon!");
  };

  const handleExportCSV = () => {
    toast.success("CSV export feature coming soon!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-4">
            <a href="/" className="inline-flex items-center gap-2 text-accent hover:text-accent/80">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Home</span>
            </a>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{screening.jobTitle}</h1>
            <p className="text-sm text-muted-foreground">
              Screening Results • {resumes.length} candidate(s) evaluated
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Candidate Rankings */}
          <div className="lg:col-span-1">
            <Card className="card-elevated sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  Candidate Rankings
                </CardTitle>
                <CardDescription>Sorted by overall match score</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {scores.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No scores available yet. Screening in progress...
                  </p>
                ) : (
                  scores.map((score, index) => {
                    const resume = resumes.find((r) => r.id === score.resumeId);
                    return (
                      <button
                        key={score.id}
                        onClick={() => setSelectedCandidate(score.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedCandidate === score.id
                            ? "border-accent bg-accent/10"
                            : "border-border hover:border-accent/50 hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-foreground">
                            #{index + 1} {resume?.candidateName || "Unknown"}
                          </span>
                          <div
                            className={`inline-flex items-center justify-center w-12 h-12 rounded-full font-bold text-sm ${
                              parseFloat(score.overallScore as any) >= 80
                                ? "bg-green-100 text-green-700"
                                : parseFloat(score.overallScore as any) >= 60
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {Math.round(parseFloat(score.overallScore as any))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{resume?.fileName}</p>
                      </button>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed View */}
          <div className="lg:col-span-2">
            {selectedCandidate ? (
              (() => {
                const selectedScore = scores.find((s) => s.id === selectedCandidate);
                const selectedResume = resumes.find((r) => r.id === selectedScore?.resumeId);

                if (!selectedScore || !selectedResume) return null;

                return (
                  <div className="space-y-6">
                    {/* Candidate Header */}
                    <Card className="card-elevated">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-2xl">{selectedResume.candidateName}</CardTitle>
                            <CardDescription>{selectedResume.fileName}</CardDescription>
                          </div>
                          <div
                            className={`inline-flex items-center justify-center w-16 h-16 rounded-full font-bold text-lg ${
                              parseFloat(selectedScore.overallScore as any) >= 80
                                ? "bg-green-100 text-green-700"
                                : parseFloat(selectedScore.overallScore as any) >= 60
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {Math.round(parseFloat(selectedScore.overallScore as any))}
                          </div>
                        </div>
                      </CardHeader>
                    </Card>

                    {/* Score Breakdown */}
                    <Card className="card-elevated">
                      <CardHeader>
                        <CardTitle>Score Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-accent mb-1">
                              {Math.round(parseFloat(selectedScore.skillsMatch as any) || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">Skills Match</p>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-accent mb-1">
                              {Math.round(parseFloat(selectedScore.experienceMatch as any) || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">Experience</p>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-accent mb-1">
                              {Math.round(parseFloat(selectedScore.educationMatch as any) || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">Education</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tabs for Details */}
                    <Card className="card-elevated">
                      <CardHeader>
                        <CardTitle>Detailed Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="highlights" className="w-full">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="highlights">Highlights</TabsTrigger>
                            <TabsTrigger value="strengths">Strengths</TabsTrigger>
                            <TabsTrigger value="gaps">Gaps</TabsTrigger>
                            <TabsTrigger value="experience">Experience</TabsTrigger>
                          </TabsList>

                          <TabsContent value="highlights" className="space-y-2 mt-4">
                            {selectedScore.keyHighlights ? (
                              JSON.parse(selectedScore.keyHighlights).map((highlight: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-2 p-2 rounded bg-green-50">
                                  <span className="text-green-600 font-bold">✓</span>
                                  <p className="text-sm text-foreground">{highlight}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No highlights available</p>
                            )}
                          </TabsContent>

                          <TabsContent value="strengths" className="space-y-2 mt-4">
                            {selectedScore.strengths ? (
                              JSON.parse(selectedScore.strengths).map((strength: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-2 p-2 rounded bg-blue-50">
                                  <span className="text-blue-600 font-bold">•</span>
                                  <p className="text-sm text-foreground">{strength}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No strengths available</p>
                            )}
                          </TabsContent>

                          <TabsContent value="gaps" className="space-y-2 mt-4">
                            {selectedScore.weaknesses ? (
                              JSON.parse(selectedScore.weaknesses).map((weakness: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-2 p-2 rounded bg-yellow-50">
                                  <span className="text-yellow-600 font-bold">!</span>
                                  <p className="text-sm text-foreground">{weakness}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No gaps identified</p>
                            )}
                          </TabsContent>

                          <TabsContent value="experience" className="space-y-2 mt-4">
                            {selectedScore.relevantExperience ? (
                              JSON.parse(selectedScore.relevantExperience).map((exp: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-2 p-2 rounded bg-purple-50">
                                  <span className="text-purple-600 font-bold">★</span>
                                  <p className="text-sm text-foreground">{exp}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No relevant experience listed</p>
                            )}
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()
            ) : (
              <Card className="card-elevated h-96 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground">Select a candidate to view detailed analysis</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
