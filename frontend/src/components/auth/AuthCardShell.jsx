export function AuthCardShell({ children }) {
  return (
    <div className="mx-auto w-full max-w-sm rounded-3xl border border-black/8 bg-white/88 p-6 shadow-2xl shadow-black/10 backdrop-blur-xl dark:border-white/10 dark:bg-[#1C1C1E]/88 dark:shadow-black/35 sm:p-8">
      {children}
    </div>
  );
}
