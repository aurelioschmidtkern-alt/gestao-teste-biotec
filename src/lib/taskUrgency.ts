import { differenceInDays, parseISO, startOfDay } from "date-fns";

export interface TaskUrgency {
  borderClass: string;
  label: string | null;
}

export function getTaskUrgency(dataFim: string | null, status: string): TaskUrgency {
  if (status === "Concluído") {
    return { borderClass: "border-l-4 border-gray-400", label: "Concluída" };
  }

  if (!dataFim) {
    return { borderClass: "", label: null };
  }

  const today = startOfDay(new Date());
  const deadline = startOfDay(parseISO(dataFim));
  const diff = differenceInDays(deadline, today);

  if (diff < 0) {
    const days = Math.abs(diff);
    return { borderClass: "border-l-4 border-red-800", label: `Atrasada há ${days} dia${days > 1 ? "s" : ""}` };
  }
  if (diff === 0) {
    return { borderClass: "border-l-4 border-red-500", label: "Vence hoje" };
  }
  if (diff === 1) {
    return { borderClass: "border-l-4 border-red-500", label: "Vence amanhã" };
  }
  if (diff <= 3) {
    return { borderClass: "border-l-4 border-orange-500", label: `Vence em ${diff} dias` };
  }
  if (diff <= 7) {
    return { borderClass: "border-l-4 border-yellow-500", label: `Vence em ${diff} dias` };
  }
  return { borderClass: "border-l-4 border-green-500", label: "Prazo ok" };
}
