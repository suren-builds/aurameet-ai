"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, PlayCircle, AlertCircle } from "lucide-react";

export type KanbanTask = {
  id: string;
  task: string;
  assignee: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "In Progress" | "Completed";
};

export function KanbanBoard({ initialTasks }: { initialTasks: KanbanTask[] }) {
  const [tasks, setTasks] = useState<KanbanTask[]>(initialTasks);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  // In a real app, this would update the backend. For this demo, it's local state.
  const updateTaskStatus = (taskId: string, newStatus: KanbanTask["status"]) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const columns = [
    { id: "Pending", title: "Pending", icon: <Clock className="w-4 h-4 text-orange-400" /> },
    { id: "In Progress", title: "In Progress", icon: <PlayCircle className="w-4 h-4 text-primary" /> },
    { id: "Completed", title: "Completed", icon: <CheckCircle2 className="w-4 h-4 text-green-500" /> }
  ];

  if (!tasks || tasks.length === 0) return <div className="text-foreground/50 italic">No action items extracted.</div>;

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex justify-end mb-4">
        <div className="flex bg-card border border-card-border rounded-lg p-1">
          <button 
            onClick={() => setViewMode("kanban")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === "kanban" ? "bg-primary text-white" : "text-foreground/70 hover:text-foreground"}`}
          >
            Kanban
          </button>
          <button 
            onClick={() => setViewMode("table")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === "table" ? "bg-primary text-white" : "text-foreground/70 hover:text-foreground"}`}
          >
            Table
          </button>
        </div>
      </div>

      {viewMode === "kanban" ? (
        <div className="grid md:grid-cols-3 gap-6 flex-1 min-h-[400px]">
          {columns.map(col => (
            <div key={col.id} className="flex flex-col bg-card/30 rounded-xl border border-card-border overflow-hidden">
              <div className="p-4 border-b border-card-border bg-card/50 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold">
                  {col.icon} {col.title}
                </div>
                <span className="bg-background px-2 py-0.5 rounded-full text-xs font-medium border border-card-border">
                  {tasks.filter(t => t.status === col.id).length}
                </span>
              </div>
              <div className="p-4 flex-1 space-y-4 overflow-y-auto">
                <AnimatePresence>
                  {tasks.filter(t => t.status === col.id).map(task => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={task.id}
                      className="p-4 bg-background border border-card-border rounded-lg shadow-sm group hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <PriorityBadge priority={task.priority} />
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {col.id !== "Pending" && (
                            <button onClick={() => updateTaskStatus(task.id, "Pending")} className="p-1 hover:bg-card rounded" title="Move to Pending">⬅️</button>
                          )}
                          {col.id === "Pending" && (
                            <button onClick={() => updateTaskStatus(task.id, "In Progress")} className="p-1 hover:bg-card rounded" title="Move to In Progress">➡️</button>
                          )}
                          {col.id === "In Progress" && (
                            <button onClick={() => updateTaskStatus(task.id, "Completed")} className="p-1 hover:bg-card rounded" title="Move to Completed">➡️</button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm font-medium mb-3">{task.task}</p>
                      <div className="flex items-center gap-2 text-xs text-foreground/60">
                        <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold uppercase">
                          {task.assignee.charAt(0)}
                        </div>
                        {task.assignee}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-card-border bg-card/30">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-foreground/70 uppercase bg-card/50 border-b border-card-border">
              <tr>
                <th className="px-6 py-3">Task</th>
                <th className="px-6 py-3">Assignee</th>
                <th className="px-6 py-3">Priority</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id} className="border-b border-card-border/50 hover:bg-card/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{task.task}</td>
                  <td className="px-6 py-4">{task.assignee}</td>
                  <td className="px-6 py-4"><PriorityBadge priority={task.priority} /></td>
                  <td className="px-6 py-4">
                    <select 
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                      className="bg-background border border-card-border rounded px-2 py-1 text-xs"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors = {
    High: "bg-red-500/10 text-red-500 border-red-500/20",
    Medium: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    Low: "bg-blue-500/10 text-blue-500 border-blue-500/20"
  };
  const color = colors[priority as keyof typeof colors] || colors.Medium;
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold border flex items-center gap-1 w-fit ${color}`}>
      {priority === "High" && <AlertCircle className="w-3 h-3" />}
      {priority}
    </span>
  );
}
