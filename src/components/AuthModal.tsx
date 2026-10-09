import React, { useState, useEffect } from "react";
import { X, LogIn, LogOut, User, Cloud, Save, FolderOpen, Trash2, CheckCircle2, Shield, Sparkles } from "lucide-react";
import {
  signInWithGoogle,
  signOutUser,
  saveProjectToFirestore,
  loadUserProjectsFromFirestore,
  deleteProjectFromFirestore,
  SavedProject,
} from "../services/firebase";
import { SubtitleCue } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onUserChanged: (user: any) => void;
  currentProject: {
    title: string;
    videoUrl: string;
    cues: SubtitleCue[];
    style: any;
  };
  onLoadProject: (proj: SavedProject) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
  currentProject,
  onLoadProject,
}) => {
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const loadProjects = async () => {
    try {
      const projects = await loadUserProjectsFromFirestore();
      setSavedProjects(projects);
    } catch (e) {
      console.warn("Failed to load projects", e);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.success && res.user) {
        onUserChanged(res.user);
        await loadProjects();
      }
    } catch (err: any) {
      alert("Đăng nhập thất bại: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    onUserChanged(null);
  };

  const handleSaveCurrentProject = async () => {
    setIsLoading(true);
    setSaveStatus(null);
    try {
      const proj: SavedProject = {
        id: "proj_" + Date.now(),
        userId: currentUser?.uid || "guest",
        title: currentProject.title || "Dự án Vietsub không tên",
        videoUrl: currentProject.videoUrl,
        cuesCount: currentProject.cues.length,
        updatedAt: new Date().toISOString(),
        cues: currentProject.cues,
        style: currentProject.style,
      };

      await saveProjectToFirestore(proj);
      setSaveStatus("Đã lưu dự án thành công vào Firebase Firestore!");
      await loadProjects();
    } catch (err: any) {
      alert("Lỗi lưu dự án: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Bạn có chắc muốn xóa dự án đã lưu này?")) {
      await deleteProjectFromFirestore(id);
      await loadProjects();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Firebase Auth & Cloud Storage</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  Firestore Connected
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Đăng nhập Google an toàn và lưu trữ tiến độ dự án trên đám mây
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* User Profile Card */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                  alt={currentUser.displayName}
                  className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover"
                />
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {currentUser.displayName || "Người dùng Google"}
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                      Đã xác thực
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">{currentUser.email || "quanlinh2210@gmail.com"}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Chưa đăng nhập</h3>
                  <p className="text-xs text-slate-400">Đăng nhập tài khoản Google để đồng bộ dự án</p>
                </div>
              </div>
            )}

            {currentUser ? (
              <button
                onClick={handleSignOut}
                className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
              >
                <LogOut className="w-3.5 h-3.5" /> Đăng xuất
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-semibold shadow-lg shadow-amber-500/25 flex items-center gap-2 transition"
              >
                <LogIn className="w-4 h-4" /> Đăng nhập với Google
              </button>
            )}
          </div>

          {/* Save Current Project */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                Dự án hiện tại trong Studio
              </h4>
              <p className="text-xs text-amber-300 font-medium mt-0.5">
                {currentProject.title || "Video đang biên tập"} ({currentProject.cues.length} câu phụ đề)
              </p>
              {saveStatus && (
                <p className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {saveStatus}
                </p>
              )}
            </div>

            <button
              onClick={handleSaveCurrentProject}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition"
            >
              <Save className="w-4 h-4" /> Lưu vào Firestore Cloud
            </button>
          </div>

          {/* Saved Projects in Firestore */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Danh sách dự án đã lưu ({savedProjects.length})</span>
              <button
                onClick={loadProjects}
                className="text-amber-400 text-xs hover:underline"
              >
                Làm mới
              </button>
            </h4>

            {savedProjects.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-800/20 border border-slate-700/40 text-center text-slate-500 text-xs">
                Chưa có dự án nào được lưu trên Firestore. Bấm "Lưu vào Firestore Cloud" ở trên để lưu dự án hiện tại.
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {savedProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onLoadProject(p);
                      onClose();
                    }}
                    className="p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-750 border border-slate-700/60 hover:border-amber-500/50 flex items-center justify-between gap-3 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                        <FolderOpen className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <h5 className="text-xs font-semibold text-white group-hover:text-amber-300 transition truncate">
                          {p.title}
                        </h5>
                        <p className="text-[11px] text-slate-400">
                          {p.cuesCount} câu • {new Date(p.updatedAt).toLocaleDateString("vi-VN")} {new Date(p.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-amber-400 font-medium group-hover:underline">
                        Mở dự án
                      </span>
                      <button
                        onClick={(e) => handleDeleteProject(p.id, e)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-700/50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400">
          <span>Dữ liệu được mã hóa và bảo mật với Firebase Security Rules</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
