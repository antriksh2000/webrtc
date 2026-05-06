import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Camera,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Phone,
  ShieldCheck,
  Video,
  VideoOff,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
const SESSION_STORAGE_KEY = "mern-shadcn-session";

const initialFormState = {
  email: "",
  password: "",
};

const directory = [
  { id: 1, name: "Aarav Sharma", email: "aarav@example.com", title: "Frontend Engineer", status: "active" },
  { id: 2, name: "Maya Chen", email: "maya@example.com", title: "Product Designer", status: "inactive" },
  { id: 3, name: "Olivia Wilson", email: "olivia@example.com", title: "Project Manager", status: "active" },
  { id: 4, name: "Noah Martinez", email: "noah@example.com", title: "QA Engineer", status: "inactive" },
  { id: 5, name: "Ibrahim Khan", email: "ibrahim@example.com", title: "DevOps Engineer", status: "active" },
  { id: 6, name: "Sophia Lee", email: "sophia@example.com", title: "Customer Success", status: "active" },
];

function getStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedSession = window.localStorage.getItem(SESSION_STORAGE_KEY);
    return storedSession ? JSON.parse(storedSession) : null;
  } catch {
    return null;
  }
}

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDuration(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export default function App() {
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState(getStoredSession);
  const [presenceFilter, setPresenceFilter] = useState("all");
  const [cameraState, setCameraState] = useState({ status: "idle", error: "" });
  const [pendingUser, setPendingUser] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const streamRef = useRef(null);
  const previewRef = useRef(null);

  const helperText = useMemo(
    () =>
      session
        ? `Welcome back, ${session.user.name}. Your dashboard is ready.`
        : "Use your Mongo-backed account credentials to sign in.",
    [session],
  );

  const filteredUsers = useMemo(() => {
    const visibleUsers = directory.filter((user) => user.email !== session?.user?.email);

    if (presenceFilter === "all") {
      return visibleUsers;
    }

    return visibleUsers.filter((user) => user.status === presenceFilter);
  }, [presenceFilter, session]);

  const activeUsers = useMemo(
    () => directory.filter((user) => user.status === "active").length,
    [],
  );
  const inactiveUsers = directory.length - activeUsers;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (session) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      return;
    }

    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  }, [session]);

  useEffect(() => {
    if (!session) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      setCameraState({ status: "idle", error: "" });
      return undefined;
    }

    let isActive = true;

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraState({
          status: "error",
          error: "Camera preview is unavailable in this browser.",
        });
        return;
      }

      setCameraState({ status: "loading", error: "" });

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!isActive) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (previewRef.current) {
          previewRef.current.srcObject = stream;
        }

        setCameraState({ status: "ready", error: "" });
      } catch (cameraError) {
        if (!isActive) {
          return;
        }

        setCameraState({
          status: "error",
          error: cameraError.message || "Allow camera permissions to preview your video feed.",
        });
      }
    }

    startCamera();

    return () => {
      isActive = false;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [session]);

  useEffect(() => {
    if (cameraState.status === "ready" && previewRef.current && streamRef.current) {
      previewRef.current.srcObject = streamRef.current;
    }
  }, [cameraState.status]);

  useEffect(() => {
    if (!activeCall) {
      setCallDuration(0);
      return undefined;
    }

    const timer = window.setInterval(() => {
      setCallDuration((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeCall]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Unable to sign in.");
      }

      setSession(payload);
      setFormData(initialFormState);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setPendingUser(null);
    setActiveCall(null);
    setSession(null);
  };

  const startCall = () => {
    if (!pendingUser) {
      return;
    }

    setActiveCall({
      participant: pendingUser,
      startedAt: Date.now(),
    });
    setPendingUser(null);
  };

  if (session) {
    return (
      <>
        <main className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-0 bg-grid bg-[size:36px_36px] opacity-10" />
          <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 py-8 lg:px-8">
            <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/75 p-6 shadow-glow backdrop-blur lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary-foreground/90">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Real-time dashboard
                </div>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-white">
                    Welcome, {session.user.name}
                  </h1>
                  <p className="text-sm text-slate-300">
                    Manage your team presence and launch video calls from one shadcn-style workspace.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary">{activeUsers} active now</Badge>
                <Badge variant="outline">{inactiveUsers} away</Badge>
                <Button variant="outline" className="gap-2" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Log out
                </Button>
              </div>
            </header>

            <div className="grid flex-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
              <Card className="border-white/10 bg-slate-950/70">
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Users className="h-5 w-5 text-primary" />
                        Team members
                      </CardTitle>
                      <CardDescription>
                        Filter active or inactive users and start a video call with one click.
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{filteredUsers.length} shown</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {["all", "active", "inactive"].map((filter) => (
                      <Button
                        key={filter}
                        variant={presenceFilter === filter ? "default" : "outline"}
                        className="capitalize"
                        onClick={() => setPresenceFilter(filter)}
                      >
                        {filter}
                      </Button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setPendingUser(user)}
                      className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-primary/40 hover:bg-primary/10"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                        {getInitials(user.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium text-white">{user.name}</p>
                          <Badge variant={user.status === "active" ? "success" : "outline"}>
                            {user.status}
                          </Badge>
                        </div>
                        <p className="truncate text-sm text-slate-400">{user.title}</p>
                      </div>
                      <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                    </button>
                  ))}
                </CardContent>
              </Card>

              <div className="grid gap-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="border-white/10 bg-slate-950/70">
                    <CardHeader className="space-y-1">
                      <CardDescription>Session</CardDescription>
                      <CardTitle className="text-xl">{session.user.email}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="border-white/10 bg-slate-950/70">
                    <CardHeader className="space-y-1">
                      <CardDescription>Camera</CardDescription>
                      <CardTitle className="text-xl capitalize">{cameraState.status}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="border-white/10 bg-slate-950/70">
                    <CardHeader className="space-y-1">
                      <CardDescription>Conference</CardDescription>
                      <CardTitle className="text-xl">
                        {activeCall ? formatDuration(callDuration) : "No active call"}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                <Card className="border-white/10 bg-slate-950/70">
                  <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <Camera className="h-5 w-5 text-primary" />
                        Camera preview
                      </CardTitle>
                      <CardDescription>
                        Your live preview stays on the right while conference controls stay within reach.
                      </CardDescription>
                    </div>
                    {activeCall ? (
                      <div className="flex items-center gap-3">
                        <Badge variant="success">In call with {activeCall.participant.name}</Badge>
                        <Button variant="outline" className="gap-2" onClick={() => setActiveCall(null)}>
                          <VideoOff className="h-4 w-4" />
                          End call
                        </Button>
                      </div>
                    ) : (
                      <Badge variant="outline">Ready to start a video call</Badge>
                    )}
                  </CardHeader>
                  <CardContent className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="relative min-h-[420px] overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
                      {cameraState.status === "ready" ? (
                        <video
                          ref={previewRef}
                          autoPlay
                          playsInline
                          muted
                          className="h-full min-h-[420px] w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-3 px-6 text-center">
                          {cameraState.status === "loading" ? (
                            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                          ) : (
                            <Camera className="h-8 w-8 text-primary" />
                          )}
                          <div className="space-y-1">
                            <p className="font-medium text-white">
                              {cameraState.status === "loading"
                                ? "Connecting to your camera"
                                : "Camera preview unavailable"}
                            </p>
                            <p className="text-sm text-slate-400">
                              {cameraState.error || "Approve camera access to display your live feed here."}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-slate-950/80 to-transparent p-4">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {activeCall ? activeCall.participant.name : session.user.name}
                          </p>
                          <p className="text-xs text-slate-300">
                            {activeCall ? "Video conference started" : "Personal preview window"}
                          </p>
                        </div>
                        <Badge variant={cameraState.status === "ready" ? "success" : "outline"}>
                          {cameraState.status === "ready" ? "Live camera" : "Waiting"}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                        <p className="text-sm font-medium text-slate-300">Call destination</p>
                        {activeCall ? (
                          <div className="mt-4 space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                                {getInitials(activeCall.participant.name)}
                              </div>
                              <div>
                                <p className="font-medium text-white">{activeCall.participant.name}</p>
                                <p className="text-sm text-slate-400">{activeCall.participant.title}</p>
                              </div>
                            </div>
                            <p className="text-sm text-slate-300">
                              Conference connected with audio and camera preview active.
                            </p>
                          </div>
                        ) : (
                          <p className="mt-4 text-sm text-slate-400">
                            Pick a teammate from the sidebar to open the confirmation popup and start a call.
                          </p>
                        )}
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                        <p className="text-sm font-medium text-slate-300">Availability summary</p>
                        <div className="mt-4 space-y-3 text-sm text-slate-300">
                          <div className="flex items-center justify-between">
                            <span>Active users</span>
                            <Badge variant="success">{activeUsers}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Inactive users</span>
                            <Badge variant="outline">{inactiveUsers}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Camera state</span>
                            <Badge variant="secondary" className="capitalize">
                              {cameraState.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-dashed border-primary/30 bg-primary/10 p-5">
                        <div className="flex items-center gap-3">
                          <Video className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium text-white">Conference-ready workspace</p>
                            <p className="text-sm text-slate-300">
                              Launch calls from the sidebar and manage your live preview without leaving the dashboard.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>

        {pendingUser ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
            <Card className="w-full max-w-md border-white/10 bg-slate-950/95 shadow-glow">
              <CardHeader className="space-y-3">
                <Badge variant="secondary" className="w-fit">
                  Confirm action
                </Badge>
                <CardTitle className="text-2xl">Start video call</CardTitle>
                <CardDescription>
                  Start a video conference with <span className="font-medium text-white">{pendingUser.name}</span>.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-white">{pendingUser.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{pendingUser.title}</p>
                  <div className="mt-3">
                    <Badge variant={pendingUser.status === "active" ? "success" : "outline"}>
                      {pendingUser.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setPendingUser(null)}>
                    Cancel
                  </Button>
                  <Button className="gap-2" onClick={startCall}>
                    <Video className="h-4 w-4" />
                    Start call
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-grid bg-[size:36px_36px] opacity-20" />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-10 lg:grid-cols-[1.1fr_520px] lg:px-8">
        <section className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary-foreground/90">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Secure access for your MERN dashboard
          </div>
          <div className="max-w-2xl space-y-5">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Shadcn-inspired login screen for a modern MERN app.
            </h1>
            <p className="text-lg text-slate-300">
              This starter pairs a React frontend with an Express and MongoDB auth API so you can
              move from UI to authentication without rebuilding the basics.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-sm font-medium text-slate-200">Design system</p>
              <p className="mt-2 text-sm text-slate-400">
                Tailwind styling and shadcn-style components keep the UI reusable and consistent.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-sm font-medium text-slate-200">Backend ready</p>
              <p className="mt-2 text-sm text-slate-400">
                Login requests post directly to an Express endpoint backed by MongoDB and JWT.
              </p>
            </div>
          </div>
        </section>

        <Card className="border-white/10 bg-slate-950/80 shadow-glow">
          <CardHeader className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>{helperText}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="demo@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <span className="text-xs text-slate-400">Minimum 8 characters</span>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={8}
                  required
                />
              </div>

              {error ? (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <Button className="w-full gap-2" size="lg" type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Continue to dashboard"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
