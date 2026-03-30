import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Briefcase, Sparkles, TrendingUp, Target, Zap } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/30 py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.1),transparent_50%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border border-primary/20 hover:scale-105 transition-transform">
                <Sparkles className="h-4 w-4 animate-pulse" />
                AI-Powered Career Intelligence
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight">
                Transform Your Resume Into Career{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-float">
                  Opportunities
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                Leverage advanced AI to extract your skills, match you with perfect job roles, 
                and discover what skills you need to land your dream career.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/analyze">
                  <Button variant="hero" size="lg" className="shadow-[var(--shadow-hover)] hover:scale-105 transition-all">
                    <FileText className="h-5 w-5" />
                    Analyze My Resume
                  </Button>
                </Link>
                <Link to="/job-skills">
                  <Button variant="outline" size="lg" className="hover:scale-105 transition-transform">
                    <Briefcase className="h-5 w-5" />
                    Explore Job Skills
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative animate-slide-in-right">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/30 rounded-3xl blur-3xl animate-pulse"></div>
              <div className="relative overflow-hidden rounded-2xl shadow-[var(--shadow-hover)] group">
                <img 
                  src={heroImage} 
                  alt="AI Resume Analysis Visualization" 
                  className="relative w-full transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-32 bg-background relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Why Choose AI Resume Analyzer?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Unlock your career potential with intelligent analysis and personalized insights
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-[var(--shadow-hover)] hover:-translate-y-2 group animate-scale-in bg-card/50 backdrop-blur-sm" style={{animationDelay: "0.1s"}}>
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <FileText className="h-7 w-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Smart Resume Parsing</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Advanced AI extracts and analyzes every skill from your resume with precision
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-[var(--shadow-hover)] hover:-translate-y-2 group animate-scale-in bg-card/50 backdrop-blur-sm" style={{animationDelay: "0.2s"}}>
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Target className="h-7 w-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Perfect Job Matching</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Get personalized job role suggestions based on your unique skill set
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-[var(--shadow-hover)] hover:-translate-y-2 group animate-scale-in bg-card/50 backdrop-blur-sm" style={{animationDelay: "0.3s"}}>
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <TrendingUp className="h-7 w-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Skill Gap Analysis</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Discover which skills you need to acquire for your target job role
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-[var(--shadow-hover)] hover:-translate-y-2 group animate-scale-in bg-card/50 backdrop-blur-sm" style={{animationDelay: "0.4s"}}>
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Zap className="h-7 w-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Instant Results</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Get comprehensive analysis and recommendations in seconds
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-[var(--shadow-hover)] hover:-translate-y-2 group animate-scale-in bg-card/50 backdrop-blur-sm" style={{animationDelay: "0.5s"}}>
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Briefcase className="h-7 w-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Job Skills Database</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Access comprehensive skill requirements for thousands of job roles
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-[var(--shadow-hover)] hover:-translate-y-2 group animate-scale-in bg-card/50 backdrop-blur-sm" style={{animationDelay: "0.6s"}}>
              <CardHeader className="space-y-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Sparkles className="h-7 w-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">Career Insights</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Gain valuable insights to make informed career decisions and plans
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-primary/5 via-accent/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,hsl(var(--accent)/0.1),transparent_50%)]"></div>
        <div className="container mx-auto px-4 text-center relative z-10 animate-fade-in-up">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
              Ready to Supercharge Your Career?
            </h2>
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
              Start analyzing your resume today and discover opportunities you never knew existed
            </p>
            <Link to="/analyze">
              <Button variant="hero" size="lg" className="text-lg px-10 py-7 shadow-[var(--shadow-hover)] hover:scale-110 transition-transform">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
