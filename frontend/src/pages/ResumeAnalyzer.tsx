import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ResumeAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a resume file first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
     const response = await fetch("/api/suggest-role/", {
     method: "POST",
     body: formData,
     });


      if (!response.ok) throw new Error("Failed to analyze resume");

      const data = await response.json();
      console.log("Backend response:", data);
      setResult(data);

      toast({
        title: "Analysis Complete!",
        description: "Your resume has been successfully analyzed.",
      });
    } catch (error) {
      console.error("Error analyzing resume:", error);
      toast({
        title: "Error",
        description: "Failed to connect to backend or analyze resume.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen py-16 lg:py-24 bg-gradient-to-b from-background to-muted/30 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.05),transparent_70%)]"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-primary/20 hover:scale-105 transition-transform">
              <Sparkles className="h-4 w-4 animate-pulse" />
              AI-Powered Analysis
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
              Resume Analysis
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Upload your resume and let our AI extract your skills and suggest perfect job matches.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Upload Section */}
            <Card className="border-2 hover:border-primary transition-all duration-300 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] animate-fade-in bg-card/50 backdrop-blur-sm">
              <CardHeader className="space-y-3">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary-foreground" />
                  </div>
                  Upload Your Resume
                </CardTitle>
                <CardDescription className="text-base">
                  Support for PDF, DOC, and DOCX formats.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="resume" className="text-base font-medium">
                    Resume File
                  </Label>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="cursor-pointer border-2 hover:border-primary transition-colors file:bg-primary/10 file:text-primary file:font-medium"
                  />
                  {file && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2 bg-muted/50 p-3 rounded-lg animate-scale-in">
                      <FileText className="h-4 w-4 text-primary" />
                      {file.name}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={!file || isAnalyzing}
                  className="w-full shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] hover:scale-105 transition-all"
                  size="lg"
                  variant="hero"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      Analyze Resume
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className="border-2 bg-white/60 backdrop-blur-sm shadow-[var(--shadow-soft)] p-6 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!result ? (
                  <p className="text-muted-foreground text-base">
                    Your analysis results will appear here after you upload a resume.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {/* Extracted Skills */}
                    {result.skills_extracted && (
                      <div>
                        <h3 className="font-semibold text-lg text-[#552619] mb-2">Extracted Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {result.skills_extracted.map((skill: string, index: number) => (
                            <span
                              key={index}
                              className="bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resume Type */}
                    {result.suggested_roles?.resume_type && (
                      <div>
                        <h3 className="font-semibold text-lg text-[#552619]">Resume Type</h3>
                        <p className="bg-primary/10 text-primary font-medium px-4 py-2 rounded-lg inline-block mt-2">
                          {result.suggested_roles.resume_type}
                        </p>
                      </div>
                    )}

                    {/* Top Job Matches */}
                    {result.suggested_roles?.main_suggestions && (
                      <div>
                        <h3 className="font-semibold text-lg text-[#552619] mb-3">Top Job Matches</h3>
                        <table className="w-full border-collapse text-sm">
                          <thead>
                            <tr className="bg-primary/10 text-primary font-semibold">
                              <th className="px-3 py-2 text-left">Job Title</th>
                              <th className="px-3 py-2 text-left">Match %</th>
                              <th className="px-3 py-2 text-left">Insight</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.suggested_roles.main_suggestions.map(
                              (
                                job: {
                                  job_title: string;
                                  match_score: number;
                                  insight: string;
                                },
                                i: number
                              ) => (
                                <tr
                                  key={i}
                                  className="border-t border-border/40 hover:bg-muted/20 transition"
                                >
                                  <td className="px-3 py-2">{job.job_title}</td>
                                  <td className="px-3 py-2 font-medium text-primary">
                                    {job.match_score}%
                                  </td>
                                  <td className="px-3 py-2 text-muted-foreground">
                                    {job.insight}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Secondary Roles */}
                    {result.suggested_roles?.secondary_exploration && (
                      <div>
                        <h3 className="font-semibold text-lg text-[#552619] mb-2">
                          Other Recommended Roles
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {result.suggested_roles.secondary_exploration.map(
                            (role: string, index: number) => (
                              <span
                                key={index}
                                className="bg-accent/10 text-accent text-sm font-medium px-3 py-1 rounded-full"
                              >
                                {role}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
