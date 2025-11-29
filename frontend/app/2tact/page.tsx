'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '@/app/lib/authStorage';

// Particle Background Component (inline for better compatibility)
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    const initParticles = () => {
      particlesRef.current = [];
      const particleCount = Math.min(50, Math.floor((canvas.width * canvas.height) / 20000) || 50);
      
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2
        });
      }
    };
    initParticles();

    let lastTime = performance.now();
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;

      if (deltaTime >= frameInterval) {
        lastTime = currentTime - (deltaTime % frameInterval);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particlesRef.current.forEach(particle => {
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
          if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
          ctx.fill();
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      resizeCanvas();
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ 
        zIndex: 1,
        willChange: 'transform',
        transform: 'translateZ(0)'
      }}
      aria-hidden="true"
    />
  );
}

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const router = useRouter();

  // Check if already authenticated and redirect to dashboard
  useEffect(() => {
    const checkAuth = async () => {
      console.log('[Login] Checking existing authentication', {
        timestamp: new Date().toISOString()
      });

      if (authStorage.isAuthenticated()) {
        const authData = authStorage.getAuthData();
        console.log('[Login] User already authenticated, redirecting to dashboard', {
          username: authData?.user?.username,
          timestamp: new Date().toISOString()
        });
        router.push('/admin/dashboard');
      }
    };

    checkAuth();
  }, [router]);

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('[Login] Submitting login request', {
        username: credentials.username,
        timestamp: new Date().toISOString()
      });

      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.username.includes('@') ? credentials.username : `${credentials.username}@grandson.com`,
          password: credentials.password,
          username: credentials.username
        }),
      });

      const data = await response.json();

      console.log('[Login] Login response received', {
        success: data.success,
        hasToken: !!data.token,
        hasUser: !!data.user,
        timestamp: new Date().toISOString()
      });

      if (data.success && data.token) {
        // Use authStorage service to store authentication data
        const authData = {
          token: data.token,
          user: data.user,
          timestamp: Date.now(),
          expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };

        console.log('[Login] Storing auth data', {
          username: data.user.username,
          timestamp: new Date().toISOString()
        });

        const storeResult = await authStorage.storeAuthData(authData);

        if (storeResult.success) {
          console.log('[Login] Auth data stored successfully, redirecting to dashboard', {
            username: data.user.username,
            retries: storeResult.retries,
            timestamp: new Date().toISOString()
          });
          
          // Small delay to ensure storage is complete before navigation
          await new Promise(resolve => setTimeout(resolve, 100));
          
          router.push('/admin/dashboard');
        } else {
          console.error('[Login] Failed to store auth data', {
            error: storeResult.error,
            retries: storeResult.retries,
            timestamp: new Date().toISOString()
          });
          setError('Erreur lors de la sauvegarde de la session');
        }
      } else {
        setError(data.error?.message || 'Nom d\'utilisateur ou mot de passe incorrect');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('[Login] Login error:', {
        error: err instanceof Error ? err.message : 'Unknown error',
        errorType: err instanceof Error ? err.constructor.name : 'Unknown',
        stack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialClick = (text: string) => {
    // Select text for easy copying
    const selection = window.getSelection();
    const range = document.createRange();
    const element = document.getElementById(text);
    if (element && selection) {
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Particle Background - Only if motion is not reduced */}
      {!prefersReducedMotion && <ParticleBackground />}
      
      {/* Background Gradient Orbs */}
      <div 
        className={`absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-500/20 rounded-full blur-3xl ${!prefersReducedMotion ? 'animate-float' : ''}`}
        style={{ animationDelay: '0s' }}
        aria-hidden="true"
      />
      <div 
        className={`absolute bottom-1/4 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-500/20 rounded-full blur-3xl ${!prefersReducedMotion ? 'animate-float' : ''}`}
        style={{ animationDelay: '2s' }}
        aria-hidden="true"
      />
      <div 
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96 bg-accent/10 rounded-full blur-3xl ${!prefersReducedMotion ? 'animate-pulse' : ''}`}
        style={{ animationDuration: '4s' }}
        aria-hidden="true"
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Logo and Title */}
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-accent to-green-500 rounded-2xl md:rounded-3xl mb-4 md:mb-6 shadow-2xl">
              <span className="text-2xl md:text-3xl" role="img" aria-label="Crown">👑</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
              <span className="text-accent">SUPER</span> ADMIN
            </h1>
            <p className="text-white/60 text-base md:text-lg font-semibold">
              Grandson Project
            </p>
            <div className="w-20 md:w-24 h-1 bg-gradient-to-r from-accent to-green-500 rounded-full mx-auto mt-3 md:mt-4"></div>
          </div>

          {/* Login Form */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            {/* Animated border */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-transparent to-green-500/20 rounded-2xl md:rounded-3xl opacity-50" aria-hidden="true"></div>
            
            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6 relative z-10">
              {/* Username Field */}
              <div className="space-y-2">
                <label 
                  htmlFor="username" 
                  className="text-white font-semibold flex items-center gap-2 text-sm md:text-base"
                >
                  <span className="text-lg md:text-xl" role="img" aria-label="User">👤</span>
                  Nom d'utilisateur
                </label>
                <div className="relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    autoComplete="username"
                    className="w-full px-4 py-3 md:py-4 bg-white/10 border border-white/20 rounded-xl md:rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-300 min-h-[44px] text-base"
                    placeholder="Entrez votre nom d'utilisateur"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    aria-label="Nom d'utilisateur administrateur"
                    aria-required="true"
                    aria-invalid={!!error}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4" aria-hidden="true">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label 
                  htmlFor="password" 
                  className="text-white font-semibold flex items-center gap-2 text-sm md:text-base"
                >
                  <span className="text-lg md:text-xl" role="img" aria-label="Lock">🔒</span>
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    className="w-full px-4 py-3 md:py-4 bg-white/10 border border-white/20 rounded-xl md:rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-300 min-h-[44px] text-base"
                    placeholder="Entrez votre mot de passe"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    aria-label="Mot de passe administrateur"
                    aria-required="true"
                    aria-invalid={!!error}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/60 hover:text-white transition-colors min-w-[44px] min-h-[44px]"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    <span className="text-lg md:text-xl">{showPassword ? '🙈' : '👁️'}</span>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div 
                  className="bg-red-500/20 border border-red-500/30 rounded-xl md:rounded-2xl p-3 md:p-4 backdrop-blur-sm"
                  role="alert"
                  aria-live="polite"
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-xl md:text-2xl" role="img" aria-label="Warning">🚨</span>
                    <div className="text-red-400 font-semibold text-sm md:text-base">{error}</div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 md:py-4 bg-gradient-to-r from-accent to-green-500 hover:from-green-500 hover:to-accent text-black font-black rounded-xl md:rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-2xl relative overflow-hidden group min-h-[44px] text-base md:text-lg"
              >
                {/* Button shine effect */}
                {!prefersReducedMotion && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" aria-hidden="true"></div>
                )}
                
                <div className="flex items-center justify-center gap-2 md:gap-3 relative z-10">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                      <span>Connexion en cours...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg md:text-xl" role="img" aria-label="Rocket">🚀</span>
                      <span>Accéder au Super Admin</span>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Default Credentials */}
            <div className="mt-6 md:mt-8 p-4 md:p-6 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl relative overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-green-500/5" aria-hidden="true"></div>
              
              <div className="text-center relative z-10">
                <div className="flex items-center justify-center gap-2 text-white/80 font-semibold mb-3 md:mb-4 text-sm md:text-base">
                  <span className="text-lg md:text-xl" role="img" aria-label="Key">🔑</span>
                  Identifiants par défaut
                </div>
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center justify-between p-3 md:p-4 bg-white/5 rounded-lg md:rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group min-h-[44px]">
                    <span className="text-white/60 group-hover:text-white/80 transition-colors text-sm md:text-base">Utilisateur:</span>
                    <code 
                      id="username-credential"
                      onClick={() => handleCredentialClick('username-credential')}
                      className="bg-accent/20 text-accent px-3 md:px-4 py-1 md:py-2 rounded-lg font-bold hover:bg-accent/30 transition-colors cursor-pointer select-all text-sm md:text-base"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleCredentialClick('username-credential');
                        }
                      }}
                      aria-label="Cliquez pour sélectionner le nom d'utilisateur"
                    >
                      admin
                    </code>
                  </div>
                  <div className="flex items-center justify-between p-3 md:p-4 bg-white/5 rounded-lg md:rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group min-h-[44px]">
                    <span className="text-white/60 group-hover:text-white/80 transition-colors text-sm md:text-base">Mot de passe:</span>
                    <code 
                      id="password-credential"
                      onClick={() => handleCredentialClick('password-credential')}
                      className="bg-accent/20 text-accent px-3 md:px-4 py-1 md:py-2 rounded-lg font-bold hover:bg-accent/30 transition-colors cursor-pointer select-all text-sm md:text-base"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleCredentialClick('password-credential');
                        }
                      }}
                      aria-label="Cliquez pour sélectionner le mot de passe"
                    >
                      admin123
                    </code>
                  </div>
                </div>
                <p className="text-white/40 text-xs mt-3 md:mt-4 flex items-center justify-center gap-1">
                  <span role="img" aria-label="Light bulb">💡</span>
                  Cliquez sur les identifiants pour les sélectionner
                </p>
                <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-300 text-xs">
                  <span role="img" aria-label="Warning">⚠️</span>
                  <span>Identifiants de développement</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-4 md:mt-6 text-center">
            <p className="text-white/40 text-xs md:text-sm flex items-center justify-center gap-2">
              <span role="img" aria-label="Lock">🔐</span>
              Connexion sécurisée SSL/TLS
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
