import { useNavigate } from "react-router-dom";
import authApi from "../../../api/auth.api";
import { useAuth } from "../../../context/auth.context";
import { useState } from "react";
import {
  Archive,
  ChevronDown,
  Code2,
  FileText,
  FolderOpen,
  Layers,
  LogOut,
  Menu,
  Palette,
  Plus,
  Search,
  Send,
  Settings,
  Sparkles,
  User,
  Users,
  Zap,
  Lock,
  Files as FilesIcon,
  Bot,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Separator } from "../../../components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../components/ui/tooltip";

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */

const TABS = ["All", "Recents", "Created by Me", "Folders", "Unsorted"] as const;

const ACTIONS = [
  { label: "Create a Blank File", icon: Plus,    highlight: false },
  { label: "Generate AI Diagram", icon: Sparkles, highlight: true  },
  { label: "Connect DevDraw MCP", icon: Code2,    highlight: false },
  { label: "Create a Template",   icon: Layers,   highlight: false },
  { label: "Create Custom Style", icon: Palette,  highlight: false },
] as const;

const NAV_ITEMS = [
  { label: "All Files",        icon: FilesIcon,  shortcut: "A",      badge: null },
  { label: "Private Files",    icon: Lock,       shortcut: null,     badge: "UPGRADE" },
  { label: "Archive",          icon: Archive,    shortcut: "E",      badge: null },
  { label: "Team Folders",     icon: FolderOpen, shortcut: null,     badge: null },
  { label: "AI Presets",       icon: Sparkles,   shortcut: "T",      badge: null },
  { label: "Custom Styles",    icon: Palette,    shortcut: "S",      badge: null },
  { label: "MCP",              icon: Zap,        shortcut: "C",      badge: null },
  { label: "DevDraw Bot",      icon: Bot,        shortcut: null,     badge: "BETA" },
  { label: "New File",         icon: Plus,       shortcut: "Alt N",  badge: null },
] as const;

// Mock files data - replace with real data from your backend
const MOCK_FILES = [
  { id: 1, name: "Untitled File",  location: "—", created: "6 months ago", edited: "2 min ago",     author: null },
  { id: 2, name: "Websocket 101",  location: "—", created: "6 months ago", edited: "3 months ago", author: null },
  { id: 3, name: "Cal.com",        location: "—", created: "6 months ago", edited: "6 months ago", author: null },
];



/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */

export const Files = () => {
  const [tab,     setTab]     = useState<string>("All");
  const [toggle,  setToggle]  = useState(false);
  const [navItem, setNavItem] = useState("Home");
  const { user, clearAuth }   = useAuth();
  const navigate              = useNavigate();

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const initial   = user?.name?.[0]?.toUpperCase() ?? "?";

  const logoutSubmit = async () => {
    await authApi.logout();
    clearAuth();
    navigate("/");
  };

  function handlecanvas(): void {
    try {
      navigate('./FabricCanvas')
    } catch {
      throw new Error 
    }
  }

  return (
    <div className="h-screen bg-background text-text-primary flex flex-col overflow-hidden">

      {/* ── Header ───────────────────────────────── */}
      <header className="shrink-0 flex items-center h-14 border-b border-border-subtle px-4 gap-3">

        {/* Left: toggle + logo */}
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger>
              <button
                onClick={() => setToggle(p => !p)}
                className="flex items-center justify-center w-7 h-7 rounded-md border border-border-subtle text-text-secondary hover:bg-surface-container hover:text-text-primary transition-colors"
                aria-label="Toggle sidebar"
                aria-expanded={toggle}
              >
                <Menu size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Toggle sidebar</TooltipContent>
          </Tooltip>

          <span className="text-base font-bold tracking-tight bg-gradient-to-r from-primary to-technical-cyan bg-clip-text text-transparent select-none">
            DevDraw
          </span>
        </div>

        {/* Center: tab bar with active underline */}
        <nav className="flex-1 flex items-center justify-center">
          <div className="hidden md:flex items-center gap-1">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative px-3 h-8 rounded-md text-sm whitespace-nowrap transition-colors ${
                  tab === t
                    ? "text-text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-container/50"
                }`}
              >
                {t}
                {tab === t && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 rounded-full bg-technical-cyan" />
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Right: search + invite + user menu */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 bg-surface-variant/20 px-3 h-8 rounded-lg border border-border-subtle focus-within:border-technical-cyan/50 focus-within:ring-1 focus-within:ring-technical-cyan/20 transition-all">
            <Search className="w-3.5 h-3.5 text-text-secondary shrink-0" />
            <input
              className="bg-transparent outline-none text-sm placeholder:text-text-secondary/60 w-40"
              placeholder="Search files…"
            />
            <kbd className="text-[10px] text-text-secondary/50 font-mono border border-border-subtle rounded px-1">/</kbd>
          </div>

          <button className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-primary/90 text-primary-foreground label-caps text-[11px] hover:bg-primary transition-colors">
            <Send className="w-3.5 h-3.5" />
            Invite
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-technical-cyan/40">
              <Avatar>
                <AvatarFallback className="bg-gradient-to-br from-primary/60 to-ai-accent/60 text-text-primary font-semibold text-xs">
                  {initial}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="bottom"
              align="end"
              sideOffset={8}
              className="w-52 bg-surface-elevated border border-border-subtle text-text-primary"
            >
              <DropdownMenuLabel className="text-text-secondary">
                <div className="flex flex-col gap-0.5">
                  <span className="text-text-primary font-medium text-sm">{user?.name}</span>
                  <span className="text-[11px] text-text-secondary truncate">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border-subtle" />
              <DropdownMenuItem className="gap-2 text-text-secondary focus:text-text-primary focus:bg-surface-container cursor-pointer">
                <User className="w-4 h-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border-subtle" />
              <DropdownMenuItem
                onClick={logoutSubmit}
                variant="destructive"
                className="gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex">

        {/* Sidebar */}
        <aside
          className={`shrink-0 border-border-subtle overflow-hidden transition-all duration-300 ease-in-out ${
            toggle ? "w-56 border-r" : "w-0 border-r-0"
          }`}
        >
          <div className="w-56 h-full flex flex-col py-4 gap-1">

            {/* Team switcher */}
            <div className="mx-3">
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full flex items-center justify-between px-3 h-10 rounded-lg bg-surface-container/30 hover:bg-surface-container transition-colors group border border-border-subtle">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary/60 to-ai-accent/60 flex items-center justify-center text-[11px] font-bold text-text-primary shadow-sm">
                      {initial}
                    </div>
                    <span className="text-sm text-text-primary font-medium truncate">
                      {firstName}&apos;s Team
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-text-secondary group-hover:text-text-primary transition-all group-data-[state=open]:rotate-180" />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  side="bottom"
                  align="start"
                  className="w-52 bg-surface-elevated border border-border-subtle text-text-primary"
                >
                  <DropdownMenuLabel className="text-text-secondary">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary/60 to-ai-accent/60 flex items-center justify-center text-xs font-bold text-text-primary">
                        {initial}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-text-primary font-semibold text-sm">{firstName}&apos;s Team</span>
                        <span className="text-[11px] text-text-secondary">Personal workspace</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border-subtle" />
                  <DropdownMenuItem className="gap-2 text-text-secondary hover:text-text-primary hover:bg-surface-container cursor-pointer">
                    <Users className="w-4 h-4" />
                    Join or Create Team
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 text-text-secondary hover:text-text-primary hover:bg-surface-container cursor-pointer">
                    <Settings className="w-4 h-4" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mx-3 my-2">
              <Separator className="bg-border-subtle" />
            </div>

            {/* Nav */}
            <div className="px-3 flex flex-col gap-0.5">
              <p className="label-caps text-[10px] text-text-secondary/50 px-2 mb-1">Navigation</p>
              {NAV_ITEMS.map(({ label, icon: Icon, shortcut, badge }) => (
                <button
                  key={label}
                  onClick={() => setNavItem(label)}
                  className={`flex items-center justify-between gap-2.5 px-2 h-8 rounded-lg text-sm transition-colors w-full ${
                    navItem === label
                      ? "bg-surface-container text-text-primary"
                      : "text-text-secondary hover:bg-surface-container/60 hover:text-text-primary"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 ${navItem === label ? "text-technical-cyan" : ""}`} />
                    <span>{label}</span>
                  </div>

                  {/* Shortcut or Badge */}
                  <div className="flex items-center gap-1.5">
                    {badge && (
                      <span className={`label-caps text-[9px] px-1.5 py-0.5 rounded ${
                        badge === "UPGRADE"
                          ? "bg-ai-accent/15 text-ai-accent"
                          : "bg-technical-cyan/15 text-technical-cyan"
                      }`}>
                        {badge}
                      </span>
                    )}
                    {shortcut && (
                      <kbd className="text-[10px] text-text-secondary/50 font-mono">
                        {shortcut}
                      </kbd>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mx-3 my-2">
              <Separator className="bg-border-subtle" />
            </div>

            <div className="px-3 flex flex-col gap-0.5">
              <p className="label-caps text-[10px] text-text-secondary/50 px-2 mb-1">Projects</p>
              <p className="px-2 text-xs text-text-secondary/40 italic">No projects yet</p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 min-h-0 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto space-y-8">

            {/* Greeting */}
            <div>
              <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
                Good morning, {firstName} 👋
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                What are you building today?
              </p>
            </div>

            {/* Action cards */}
            <section>
              <p className="label-caps text-[10px] text-text-secondary/60 mb-3">Quick actions</p>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-5">
                {ACTIONS.map(({ label, icon: Icon, highlight }) => (
                  <button
                    key={label}
                    className={`group relative glass-panel rounded-xl h-36 flex flex-col items-center justify-center gap-3 transition-all duration-200
                      hover:-translate-y-1 hover:border-technical-cyan/30
                      hover:shadow-[0_8px_32px_rgba(6,182,212,0.12)]
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-technical-cyan/40
                      ${highlight ? "border-ai-accent/30 shadow-[0_0_24px_rgba(139,92,246,0.10)]" : ""}`}
                      onClick={handlecanvas}
                  >
                    {/* Radial glow blob */}
                    <div
                      className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                        highlight
                          ? "bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.15),transparent_60%)]"
                          : "bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.08),transparent_60%)]"
                      }`}
                    />

                    {/* Icon badge */}
                    <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      highlight
                        ? "bg-ai-accent/15 group-hover:bg-ai-accent/25"
                        : "bg-surface-variant/40 group-hover:bg-technical-cyan/15"
                    }`}>
                      <Icon className={`w-5 h-5 transition-colors ${
                        highlight
                          ? "text-ai-accent"
                          : "text-text-secondary group-hover:text-technical-cyan"
                      }`} />
                    </div>

                    <span className="relative text-sm text-text-primary text-center px-2 leading-snug">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Recent files */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <p className="label-caps text-[10px] text-text-secondary/60">Recent files</p>
                <button className="text-xs text-text-secondary hover:text-technical-cyan transition-colors">
                  View all
                </button>
              </div>

              {MOCK_FILES.length === 0 ? (
                // Empty state
                <div className="glass-panel rounded-2xl flex flex-col items-center justify-center py-16 gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-surface-variant/40 flex items-center justify-center">
                    <FileText className="w-7 h-7 text-text-secondary/50" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-text-primary">No files yet</p>
                    <p className="mt-1 text-xs text-text-secondary max-w-xs">
                      Create your first file or generate a diagram with AI to get started.
                    </p>
                  </div>
                  <button className="flex items-center gap-2 px-4 h-9 rounded-lg border border-border-subtle text-sm text-text-secondary hover:border-technical-cyan/40 hover:text-text-primary hover:bg-surface-container/60 transition-all">
                    <Plus className="w-4 h-4" />
                    New file
                  </button>
                </div>
              ) : (
                // Files table
                <div className="glass-panel rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border-subtle">
                        <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary label-caps">Name</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary label-caps">Location</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary label-caps">Created</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary label-caps">Edited</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary label-caps">Author</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_FILES.map((file) => (
                        <tr
                          key={file.id}
                          className="border-b border-border-subtle/50 last:border-0 hover:bg-surface-container/30 transition-colors cursor-pointer"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-surface-variant/40 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4 text-text-secondary" />
                              </div>
                              <span className="text-sm text-text-primary font-medium">{file.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-text-secondary">{file.location}</td>
                          <td className="px-4 py-3 text-sm text-text-secondary">{file.created}</td>
                          <td className="px-4 py-3 text-sm text-text-secondary">{file.edited}</td>
                          <td className="px-4 py-3 text-sm text-text-secondary">{file.author || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

          </div>
        </main>
      </div>
    </div>
  );
};
