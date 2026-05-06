import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Camera,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Phone,
  ShieldCheck,
  Users,
  Video,
  VideoOff,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
const SESSION_STORAGE_KEY = "mern-shadcn-session";

const initialFormState = {
  name: "",
  email: "",
  password: "",
};

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
  const [authMode, setAuthMode] = useState("login");
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState(getStoredSession);
  const [users, setUsers] = useState([]);
  const [usersState, setUsersState] = useState({ status: "idle", error: "" });
  const [cameraState, setCameraState] = useState({ status: "idle", error: "" });
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [pendingUser, setPendingUser] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const streamRef = useRef(null);
  const previewRef = useRef(null);

  const helperText = useMemo(
    () =>
      session
        ? `Welcome back, ${session.user.name}. Your dashboard is ready.`
        : authMode === "signup"
          ? "Create a Mongo-backed account to enter the dashboard."
          : "Use your Mongo-backed account credentials to sign in.",
    [authMode, session],
  );
  const cameraStatusLabel = cameraState.status === "ready" ? (cameraEnabled ? "live" : "off") : cameraState.status;
  const totalUsersInDatabase = session ? users.length + 1 : users.length;

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (previewRef.current) {
      previewRef.current.srcObject = null;
    }
  };

  const requestCameraPreview = async (isCameraEnabled = cameraEnabled) => {
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

      stopCameraStream();

      stream.getVideoTracks().forEach((track) => {
        track.enabled = isCameraEnabled;
      });

      streamRef.current = stream;

      if (previewRef.current) {
        previewRef.current.srcObject = stream;
      }

      setCameraState({ status: "ready", error: "" });
    } catch (cameraError) {
      setCameraState({
        status: "error",
        error: cameraError.message || "Allow camera permissions to preview your video feed.",
      });
    }
  };

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
      setUsers([]);
      setUsersState({ status: "idle", error: "" });
      setPendingUser(null);
      setActiveCall(null);
      setCameraEnabled(true);
      stopCameraStream();
      setCameraState({ status: "idle", error: "" });
      return undefined;
    }

    let isActive = true;

    async function startCamera() {
      if (!isActive) {
        return;
      }

      await requestCameraPreview(cameraEnabled);
    }

    startCamera();

    return () => {
      isActive = false;
      stopCameraStream();
    };
  }, [session]);

  useEffect(() => {
    if (cameraState.status === "ready" && previewRef.current && streamRef.current) {
      previewRef.current.srcObject = streamRef.current;
    }
  }, [cameraState.status]);

  useEffect(() => {
    if (!streamRef.current) {
      return;
    }

    streamRef.current.getVideoTracks().forEach((track) => {
      track.enabled = cameraEnabled;
    });
  }, [cameraEnabled]);

  useEffect(() => {
    if (!session?.token) {
      return;
    }

    let isActive = true;

    async function loadUsers() {
      setUsersState({ status: "loading", error: "" });

      try {
        const response = await fetch(`${API_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });

        const payload = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            setSession(null);
          }

          throw new Error(payload.message || "Unable to load users.");
        }

        if (!isActive) {
          return;
        }

        setUsers(payload.users);
        setUsersState({ status: "ready", error: "" });
      } catch (usersError) {
        if (!isActive) {
          return;
        }

        setUsers([]);
        setUsersState({
          status: "error",
          error: usersError.message || "Unable to load users.",
        });
      }
    }

    loadUsers();

    return () => {
      isActive = false;
    };
  }, [session]);

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
      const endpoint = authMode === "signup" ? "signup" : "login";
      const response = await fetch(`${API_URL}/api/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          authMode === "signup"
            ? formData
            : {
                email: formData.email,
                password: formData.password,
              },
        ),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload.message || (authMode === "signup" ? "Unable to create account." : "Unable to sign in."),
        );
      }

      setSession(payload);
      setAuthMode("login");
      setFormData(initialFormState);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setSession(null);
  };

  const handleAuthModeChange = (mode) => {
    setAuthMode(mode);
    setError("");
    setFormData(initialFormState);
  };

  const handleCameraToggle = async () => {
    const nextEnabled = !cameraEnabled;
    setCameraEnabled(nextEnabled);

    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = nextEnabled;
      });
      return;
    }

    if (nextEnabled && session) {
      await requestCameraPreview(nextEnabled);
    }
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
                    Manage registered teammates and launch video calls from one shadcn-style workspace.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary">{users.length} in sidebar</Badge>
                <Badge variant="outline" className="capitalize">
                  Camera {cameraStatusLabel}
                </Badge>
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
                        Registered users
                      </CardTitle>
                      <CardDescription>
                        The sidebar only shows users loaded from your database.
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{users.length} shown</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {usersState.status === "loading" ? (
                    <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-center">
                      <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
                      <p className="text-sm text-slate-300">Loading registered users...</p>
                    </div>
                  ) : null}

                  {usersState.status === "error" ? (
                    <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-red-200">
                      {usersState.error}
                    </div>
                  ) : null}

                  {usersState.status !== "loading" && users.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-slate-400">
                      No other registered users are available in the database yet.
                    </div>
                  ) : null}

                  {users.map((user) => (
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
                        <p className="truncate font-medium text-white">{user.name}</p>
                        <p className="truncate text-sm text-slate-400">{user.email}</p>
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
                      <CardDescription>Users in database</CardDescription>
                      <CardTitle className="text-xl">{totalUsersInDatabase}</CardTitle>
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
                        Keep your live preview visible and turn your camera off any time during a call.
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {activeCall ? (
                        <Badge variant="success">In call with {activeCall.participant.name}</Badge>
                      ) : (
                        <Badge variant="outline">Ready to start a video call</Badge>
                      )}
                      <Button variant="outline" className="gap-2" onClick={handleCameraToggle}>
                        {cameraEnabled ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                        {cameraEnabled ? "Turn camera off" : "Turn camera on"}
                      </Button>
                      {activeCall ? (
                        <Button variant="outline" className="gap-2" onClick={() => setActiveCall(null)}>
                          <VideoOff className="h-4 w-4" />
                          End call
                        </Button>
                      ) : null}
                    </div>
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

                      {cameraState.status === "ready" && !cameraEnabled ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/75 px-6 text-center">
                          <VideoOff className="h-8 w-8 text-primary" />
                          <div className="space-y-1">
                            <p className="font-medium text-white">Camera is turned off</p>
                            <p className="text-sm text-slate-300">
                              Turn your camera back on whenever you want to rejoin visually.
                            </p>
                          </div>
                        </div>
                      ) : null}

                      <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-slate-950/80 to-transparent p-4">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {activeCall ? activeCall.participant.name : session.user.name}
                          </p>
                          <p className="text-xs text-slate-300">
                            {activeCall ? "Video conference started" : "Personal preview window"}
                          </p>
                        </div>
                        <Badge variant={cameraState.status === "ready" && cameraEnabled ? "success" : "outline"}>
                          {cameraState.status === "ready"
                            ? cameraEnabled
                              ? "Live camera"
                              : "Camera off"
                            : "Waiting"}
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
                                <p className="text-sm text-slate-400">{activeCall.participant.email}</p>
                              </div>
                            </div>
                            <p className="text-sm text-slate-300">
                              Conference connected with audio and your camera preview {cameraEnabled ? "active" : "turned off"}.
                            </p>
                          </div>
                        ) : (
                          <p className="mt-4 text-sm text-slate-400">
                            Pick a registered user from the sidebar to open the confirmation popup and start a call.
                          </p>
                        )}
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                        <p className="text-sm font-medium text-slate-300">Workspace summary</p>
                        <div className="mt-4 space-y-3 text-sm text-slate-300">
                          <div className="flex items-center justify-between">
                            <span>Total users in DB</span>
                            <Badge variant="secondary">{totalUsersInDatabase}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Users in sidebar</span>
                            <Badge variant="outline">{users.length}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Camera state</span>
                            <Badge variant="secondary" className="capitalize">
                              {cameraStatusLabel}
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
                  <p className="mt-1 text-sm text-slate-400">{pendingUser.email}</p>
                  <div className="mt-3">
                    <Badge variant="secondary">Registered account</Badge>
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
              Sign in or create an account for your real-time workspace.
            </h1>
            <p className="text-lg text-slate-300">
              This starter pairs a React frontend with an Express and MongoDB auth API so new users
              can register, sign in, and join the dashboard without rebuilding the basics.
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
              <p className="text-sm font-medium text-slate-200">Registration ready</p>
              <p className="mt-2 text-sm text-slate-400">
                Sign-up and sign-in requests post directly to Express endpoints backed by MongoDB and JWT.
              </p>
            </div>
          </div>
        </section>

        <Card className="border-white/10 bg-slate-950/80 shadow-glow">
          <CardHeader className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>{authMode === "signup" ? "Create account" : "Sign in"}</CardTitle>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={authMode === "login" ? "default" : "outline"}
                  onClick={() => handleAuthModeChange("login")}
                >
                  Sign in
                </Button>
                <Button
                  type="button"
                  variant={authMode === "signup" ? "default" : "outline"}
                  onClick={() => handleAuthModeChange("signup")}
                >
                  Sign up
                </Button>
              </div>
            </div>
            <CardDescription>{helperText}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              {authMode === "signup" ? (
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    name="name"
                    autoComplete="name"
                    placeholder="Alex Johnson"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
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
                  autoComplete={authMode === "signup" ? "new-password" : "current-password"}
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
                {isLoading
                  ? authMode === "signup"
                    ? "Creating account..."
                    : "Signing in..."
                  : authMode === "signup"
                    ? "Create account"
                    : "Continue to dashboard"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
