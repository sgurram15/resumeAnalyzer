import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Zap } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Home() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobFile, setJobFile] = useState<File | null>(null);
  const [resumes, setResumes] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const uploadScreening = trpc.screening.create.useMutation();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">AI Resume Screener</CardTitle>
            <CardDescription>Intelligent candidate evaluation powered by AI</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Sign in to start screening resumes against your job requirements
            </p>
            <a href={getLoginUrl()}>
              <Button className="w-full" size="lg">
                Sign In
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleJobFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
      if (validTypes.includes(file.type)) {
        setJobFile(file);
        toast.success(`Job description file selected: ${file.name}`);
      } else {
        toast.error("Please upload a PDF, DOCX, or TXT file");
      }
    }
  };

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      return validTypes.includes(file.type);
    });

    if (validFiles.length !== files.length) {
      toast.error("Some files were skipped. Only PDF and DOCX files are supported for resumes.");
    }

    setResumes((prev) => [...prev, ...validFiles]);
    toast.success(`${validFiles.length} resume(s) added`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter((file) => {
      const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      return validTypes.includes(file.type);
    });

    if (validFiles.length > 0) {
      setResumes((prev) => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} resume(s) added`);
    } else {
      toast.error("Please drop PDF or DOCX files only");
    }
  };

  const removeResume = (index: number) => {
    setResumes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartScreening = async () => {
    if (!jobTitle.trim() && !jobDescription.trim() && !jobFile) {
      toast.error("Please provide a job description");
      return;
    }

    if (resumes.length === 0) {
      toast.error("Please upload at least one resume");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await uploadScreening.mutateAsync({
        jobTitle: jobTitle || "Untitled Position",
        jobDescription: jobDescription || "",
        jobFile: jobFile || undefined,
        resumes,
      });

      toast.success("Screening started! Analyzing candidates...");
      // Navigate to results page
      window.location.href = `/results/${result.screeningId}`;
    } catch (error) {
      console.error("Error starting screening:", error);
      toast.error("Failed to start screening. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Zap className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AI Resume Screener</h1>
              <p className="text-xs text-muted-foreground">Intelligent candidate evaluation</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Welcome, <span className="font-semibold text-foreground">{user?.name}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Job Description */}
          <Card className="mb-8 card-elevated">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white font-bold text-sm">
                  1
                </div>
                <div>
                  <CardTitle>Job Description</CardTitle>
                  <CardDescription>Provide the job requirements and qualifications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Job Title</label>
                <Input
                  placeholder="e.g., Senior Software Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="input-focus"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Job Description</label>
                <Textarea
                  placeholder="Paste or type the complete job description here... Include responsibilities, required skills, experience level, education, and any other relevant qualifications."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="input-focus min-h-32"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Or Upload Job Description File</label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleJobFileChange}
                    className="hidden"
                    id="job-file-input"
                  />
                  <label
                    htmlFor="job-file-input"
                    className="block p-4 border-2 border-dashed border-border rounded-lg text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors"
                  >
                    <FileText className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">
                      {jobFile ? jobFile.name : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-muted-foreground">PDF, DOCX, or TXT</p>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Resume Upload */}
          <Card className="card-elevated">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white font-bold text-sm">
                  2
                </div>
                <div>
                  <CardTitle>Upload Resumes</CardTitle>
                  <CardDescription>Add candidate resumes for screening</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`upload-zone ${isDragging ? "active" : ""}`}
              >
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Drag and drop resumes here</p>
                <p className="text-xs text-muted-foreground">or</p>
                <label htmlFor="resume-file-input" className="inline-block mt-2">
                  <Button variant="outline" size="sm" asChild>
                    <span>Browse Files</span>
                  </Button>
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx"
                  onChange={handleResumeFileChange}
                  className="hidden"
                  id="resume-file-input"
                />
                <p className="text-xs text-muted-foreground mt-2">PDF or DOCX files only</p>
              </div>

              {/* Uploaded Resumes List */}
              {resumes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Uploaded: <span className="text-accent font-bold">{resumes.length} file(s)</span>
                  </p>
                  <div className="space-y-2">
                    {resumes.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-accent" />
                          <span className="text-sm text-foreground truncate">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          onClick={() => removeResume(index)}
                          className="text-xs text-destructive hover:text-destructive/80 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Start Screening Button */}
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleStartScreening}
              disabled={isProcessing || (!jobTitle.trim() && !jobDescription.trim() && !jobFile) || resumes.length === 0}
              size="lg"
              className="px-8"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Start Screening
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
