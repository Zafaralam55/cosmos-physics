import { useApp } from "@/contexts/AppContext";
import { useCourse } from "@/contexts/AppContext";

export function useProgressFor(courseId: string) {
  const { state } = useApp();
  const course = useCourse(courseId);
  const total = course?.chapters.length ?? 0;
  const done = state.courseProgress.filter((p) => p.courseId === courseId).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const completed = total > 0 && done >= total;
  return { done, total, pct, completed };
}

export function useCourseProgressMap(courseIds: string[]) {
  const { state } = useApp();
  const map: Record<string, { done: number; total: number; pct: number; completed: boolean }> = {};
  for (const id of courseIds) {
    map[id] = { done: 0, total: 0, pct: 0, completed: false };
  }
  for (const p of state.courseProgress) {
    if (map[p.courseId] !== undefined) {
      map[p.courseId].done++;
    }
  }
  return map;
}
