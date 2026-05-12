import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, MessageCircle, Book, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import AnimatedAtom from "@/components/AnimatedAtom";
import BackgroundAtom from "@/components/BackgroundAtom";

const Index = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) return; // Only redirect if logged in
    if (isAdmin) {
      navigate("/app/AdminDashboard", { replace: true });
    } else {
      navigate("/app", { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  const features = [
    {
      icon: Activity,
      title: "Social Feed",
      description: "Share posts, connect with friends, and stay updated with the latest happenings."
    },
    {
      icon: MessageCircle,
      title: "Real-time Chat",
      description: "Instant messaging with online indicators and seamless communication."
    },
    {
      icon: Book,
      title: "Q&A Community",
      description: "Ask questions, share knowledge, and learn from the community."
    },
    {
      icon: FileText,
      title: "Resource Sharing",
      description: "Upload, share, and access documents and files with ease."
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="relative w-full flex flex-col items-center justify-center min-h-[60vh]">
        <BackgroundAtom />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Focus Hub
            </h1>
            {/* <AnimatedAtom /> */}
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A modern alumni social platform that brings together communication, knowledge sharing, and collaboration in one beautiful interface.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild variant="outline" size="lg" className="px-8">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8">
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <feature.icon className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Join thousands of users already on Focus
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
