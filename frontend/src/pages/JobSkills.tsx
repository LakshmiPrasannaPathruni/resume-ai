import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_URL;

const JobSkills = () => {
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState<any>(null);
  const { toast } = useToast();

  // Fetch job titles on mount
  useEffect(() => {
    const fetchTitles = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/job-titles/`);
        const data = await res.json();
        setJobTitles(data.job_titles || []);
      } catch (err) {
        console.error("Error loading job titles:", err);
        toast({
          title: "Error",
          description: "Failed to load job titles.",
          variant: "destructive",
        });
      }
    };
    fetchTitles();
  }, [toast]);

  // Fetch skills when a job is selected
  const fetchSkills = async (title: string) => {
    setIsLoading(true);
    setSelectedJob(title);
    setSkills(null);

    try {
      const res = await fetch(
        `${API_BASE}/api/job-skills?title=${encodeURIComponent(title)}`
      );
      const data = await res.json();

      if (data.error) {
        setSkills(null);
        toast({
          title: "No skills found",
          description: data.error,
          variant: "destructive",
        });
      } else {
        setSkills(data);
        toast({
          title: "Skills Loaded",
          description: `Showing skills for ${title}`,
        });
      }
    } catch (err) {
      console.error("Error fetching skills:", err);
      toast({
        title: "Error",
        description: "Unable to connect to backend.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 lg:py-24 bg-gradient-to-b from-background to-muted/30 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--accent)/0.05),transparent_70%)]"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-full text-sm font-medium mb-6 border border-primary/20">
              <Sparkles className="h-4 w-4 animate-pulse" />
              Job Skills Explorer
            </div>
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Browse Job Roles & Required Skills
            </h1>
          </div>

          {/* Dropdown Section */}
          <Card className="border-2 bg-card/50 backdrop-blur-sm shadow-[var(--shadow-soft)] p-6">
            <CardHeader>
              <CardTitle>Select a Job Role</CardTitle>
              <CardDescription>Choose from available roles to view required skills</CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="job-select" className="block mb-2 text-base font-medium">
                Job Title
              </Label>
              <select
                id="job-select"
                value={selectedJob}
                onChange={(e) => fetchSkills(e.target.value)}
                className="w-full border-2 border-border rounded-lg p-3 text-base bg-white focus:border-primary outline-none transition"
              >
                <option value="">-- Select a Job --</option>
                {jobTitles.map((title, idx) => (
                  <option key={idx} value={title}>
                    {title}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Skills Display */}
          {isLoading ? (
            <div className="text-center mt-12 text-lg text-primary flex justify-center items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" /> Loading skills...
            </div>
          ) : (
            skills && (
              <Card className="mt-10 border-2 bg-white/60 backdrop-blur-sm shadow-[var(--shadow-soft)] p-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                    {skills.searched_title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {skills.matched_roles?.map((role: any, i: number) => (
                    <div key={i} className="mb-8 border-b pb-4">
                      <div className="flex justify-between mb-3">
                        <h3 className="font-semibold text-lg">{role.job_title}</h3>
                        <span className="text-primary font-medium">
                          {role.similarity_score}% match
                        </span>
                      </div>

                      {Object.entries(role.skills_by_category).map(
                        ([cat, skillList]: [string, any]) => (
                          <div key={cat} className="mb-4">
                            <h4 className="font-medium text-[#552619] mb-2">{cat}</h4>
                            <div className="flex flex-wrap gap-2">
                              {skillList.map((skill: string, j: number) => (
                                <span
                                  key={j}
                                  className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default JobSkills;