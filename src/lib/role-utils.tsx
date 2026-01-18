import { IconShieldBolt, IconStethoscope, IconFirstAidKit, IconUserCheck, IconUser } from "@tabler/icons-react";

export const getRoleIcon = (roleName: string = "") => {
  const lower = roleName.toLowerCase();
  if (lower.includes("admin")) return <IconShieldBolt className="size-4 text-red-500" />;
  if (lower.includes("dokter")) return <IconStethoscope className="size-4 text-blue-500" />;
  if (lower.includes("paramedik") || lower.includes("perawat")) return <IconFirstAidKit className="size-4 text-green-500" />;
  if (lower.includes("supervisor")) return <IconUserCheck className="size-4 text-amber-500" />;
  return <IconUser className="size-4 text-muted-foreground" />;
};
