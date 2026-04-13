export default function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const levels = [
    { label: "Muito fraca", color: "bg-red-500", width: "w-1/5" },
    { label: "Fraca", color: "bg-orange-500", width: "w-2/5" },
    { label: "Razoavel", color: "bg-amber-500", width: "w-3/5" },
    { label: "Boa", color: "bg-lime-500", width: "w-4/5" },
    { label: "Forte", color: "bg-emerald-500", width: "w-full" },
  ];

  const level = levels[Math.min(score, levels.length) - 1] || levels[0];

  return (
    <div className="mt-2 space-y-1">
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${level.color} ${level.width}`} />
      </div>
      <p className={`text-[10px] font-medium ${level.color.replace("bg-", "text-")}`}>
        {level.label}
      </p>
    </div>
  );
}
