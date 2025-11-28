import { Terminal, Users, Code, Zap } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/context/use-auth";
import { useNavigate } from "react-router";
import WaveDecorations from "@/components/WaveDecorations";
import AuthForm from "@/components/auth/auth-form";

export default function App() {
  const { authenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authenticated) {
      navigate("/rooms");
    }
  }, [authenticated, navigate]);

  const features = [
    {
      icon: <Users className="w-5 h-5" />,
      title: "Real-time Collaboration",
      description: "Code together with your team in real-time",
    },
    {
      icon: <Terminal className="w-5 h-5" />,
      title: "Integrated Terminal",
      description: "Run commands without leaving the editor",
    },
    {
      icon: <Code className="w-5 h-5" />,
      title: "Multi-language Support",
      description: "Support for all major programming languages",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Fast & Reliable",
      description: "Lightning-fast performance with auto-save",
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <AuthForm />

          <div className="text-white space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src="/logo.png"
                  className="w-16 h-16 pointer-events-none drop-shadow-lg"
                  alt="TIF-IDE Logo"
                />
                <h1 className="text-5xl lg:text-6xl font-bold font-mono bg-linear-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  TIF-IDE
                </h1>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
                  Real-time Collaborative
                  <span className="block text-primary">Code Editor</span>
                </h2>
                <p className="text-xl text-slate-300 leading-relaxed max-w-lg">
                  Code together in real-time with your team. Featuring
                  integrated terminal, multi-language support, and seamless
                  collaboration.
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="text-primary mt-0.5 shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <WaveDecorations />
    </div>
  );
}
