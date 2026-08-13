import { prisma } from "../lib/prisma";
import { socketService } from "./socketService";

export const ruleEngineService = {
  /**
   * 3. PERFORMANCE SCORING SYSTEM
   * Score = Tasks completed (40%) + On-time (30%) + Approval rate (30%)
   */
  async calculatePerformanceScore(userId: string) {
    const tasks = await prisma.task.findMany({
      where: { assigneeId: userId },
      include: {
        submissions: true,
      },
    });

    if (tasks.length === 0) return 0;

    const completedTasks = tasks.filter((t) => t.status === "APPROVED");
    const totalCompleted = completedTasks.length;

    // 40% weight: Tasks completed relative to a target? 
    // The prompt says "Tasks completed (weight 40%)". 
    // Usually, this is compared against total assigned tasks.
    const completedScore = (totalCompleted / tasks.length) * 40;

    // 30% weight: On-time completion
    const onTimeTasks = completedTasks.filter((t) => {
      if (!t.deadline) return true; // No deadline = on time? Or exclude? Let's assume on time.
      return new Date(t.updatedAt) <= new Date(t.deadline);
    });
    const onTimeScore = totalCompleted > 0 ? (onTimeTasks.length / totalCompleted) * 30 : 0;

    // 30% weight: Approval rate
    // Approval rate = (Approved Submissions) / (Total Submissions)
    const allSubmissions = tasks.flatMap((t) => t.submissions);
    const approvedSubmissions = allSubmissions.filter((s) => s.status === "APPROVED");
    const approvalRateScore = allSubmissions.length > 0 ? (approvedSubmissions.length / allSubmissions.length) * 30 : 0;

    return Math.round(completedScore + onTimeScore + approvalRateScore);
  },

  /**
   * 2. RISK ASSESSMENT (THE RED FLAG SYSTEM)
   */
  async getEmployeeRisk(userId: string) {
    const overdueTasksCount = await prisma.task.count({
      where: {
        assigneeId: userId,
        status: { not: "APPROVED" },
        deadline: { lt: new Date() },
      },
    });

    if (overdueTasksCount >= 3) {
      return "Underperforming";
    }
    return "Normal";
  },

  async getProjectRisk(projectId: string) {
    const tasks = await prisma.task.findMany({
      where: { projectId },
    });

    if (tasks.length === 0) return "Healthy";

    const delayedTasks = tasks.filter((t) => 
      t.status !== "APPROVED" && t.deadline && new Date(t.deadline) < new Date()
    );

    const delayedPercentage = (delayedTasks.length / tasks.length) * 100;

    if (delayedPercentage > 30) {
      return "At Risk";
    }
    return "Healthy";
  },

  /**
   * 4. AUTO WORKLOAD BALANCER
   */
  async getWorkloadSuggestions() {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { tasksAssigned: { where: { status: { notIn: ["APPROVED", "REJECTED"] } } } }
        }
      }
    });

    const overloaded = users.filter(u => u._count.tasksAssigned > 8);
    const underutilized = users.filter(u => u._count.tasksAssigned < 3);

    const suggestions: string[] = [];

    if (overloaded.length > 0 && underutilized.length > 0) {
      for (const user of overloaded) {
        // Find the least busy underutilized user
        const targetUser = underutilized.sort((a, b) => a._count.tasksAssigned - b._count.tasksAssigned)[0];
        
        // Find a task to reassign (this is simplified)
        const taskToReassign = await prisma.task.findFirst({
          where: { assigneeId: user.id, status: { notIn: ["APPROVED", "REJECTED"] } }
        });

        if (taskToReassign) {
          suggestions.push(`Reassign Task "${taskToReassign.title}" from ${user.fullName || user.email} to ${targetUser.fullName || targetUser.email}`);
        }
      }
    }

    return {
      overloaded: overloaded.map(u => ({ id: u.id, name: u.fullName || u.email, count: u._count.tasksAssigned })),
      underutilized: underutilized.map(u => ({ id: u.id, name: u.fullName || u.email, count: u._count.tasksAssigned })),
      suggestions
    };
  },

  /**
   * 7. PRIORITY ENGINE
   */
  async getPrioritySuggestions() {
    // Logic: Deadline near AND high dependency -> High priority
    const soon = new Date();
    soon.setDate(soon.getDate() + 2); // Within 2 days

    const tasks = await prisma.task.findMany({
      where: {
        status: { notIn: ["APPROVED", "REJECTED"] },
        deadline: { lte: soon }
      },
      include: {
        dependentTasks: true
      }
    });

    return tasks
      .filter(t => t.dependentTasks.length > 0)
      .map(t => ({
        taskId: t.id,
        title: t.title,
        reason: "Near deadline with high dependencies",
        suggestedPriority: "HIGH"
      }));
  },

  /**
   * 8. PROJECT PROGRESS TRACKER
   */
  async getProjectProgress(projectId: string) {
    const tasks = await prisma.task.findMany({
      where: { projectId }
    });

    if (tasks.length === 0) return { percentage: 0, status: "No tasks" };

    const completed = tasks.filter(t => t.status === "APPROVED").length;
    const percentage = Math.round((completed / tasks.length) * 100);

    // Expected progress based on deadlines?
    // Simplified: "Project is X% behind schedule"
    const totalTasks = tasks.length;
    const shouldBeCompleted = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date()).length;
    
    let behind = 0;
    if (shouldBeCompleted > completed) {
      behind = Math.round(((shouldBeCompleted - completed) / totalTasks) * 100);
    }

    return {
      percentage,
      behindPercentage: behind,
      message: behind > 0 ? `Project is ${behind}% behind schedule` : "Project is on schedule"
    };
  },

  /**
   * 5. TASK TIME ANALYSIS
   */
  async getTaskTimeAnalysis(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { timeLogs: true }
    });

    if (!task) return null;

    const actualTimeMinutes = task.timeLogs.reduce((acc, log) => acc + (log.totalTime || 0), 0) / 60;
    const estimatedTime = task.estimatedTime || 0;

    let efficiency: "FAST" | "NORMAL" | "SLOW" = "NORMAL";
    if (estimatedTime > 0) {
      if (actualTimeMinutes < estimatedTime * 0.8) efficiency = "FAST";
      else if (actualTimeMinutes > estimatedTime * 1.2) efficiency = "SLOW";
    }

    return {
      taskId,
      title: task.title,
      estimatedTime,
      actualTimeMinutes,
      efficiency
    };
  },

  /**
   * 6. AUTO DAILY & WEEKLY REPORTS
   */
  async generateDailyReport(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const tasks = await prisma.task.findMany({
      where: { assigneeId: userId }
    });

    const completedToday = tasks.filter(t => t.status === "APPROVED" && t.updatedAt >= startOfDay);
    const delayed = tasks.filter(t => t.status !== "APPROVED" && t.deadline && new Date(t.deadline) < new Date());
    const active = tasks.filter(t => t.status !== "APPROVED" && t.status !== "REJECTED");

    return {
      completedToday: completedToday.length,
      delayedTasks: delayed.length,
      activeTasks: active.length,
      reportDate: new Date()
    };
  },

  async generateWeeklyReport() {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const users = await prisma.user.findMany({
      include: {
        tasksAssigned: {
          where: { updatedAt: { gte: startOfWeek } }
        }
      }
    });

    const performance = await Promise.all(users.map(async u => ({
      userId: u.id,
      name: u.fullName || u.email,
      score: await this.calculatePerformanceScore(u.id)
    })));

    const topPerformer = performance.sort((a, b) => b.score - a.score)[0];

    const delayedTasks = await prisma.task.findMany({
      where: {
        status: { not: "APPROVED" },
        deadline: { lt: new Date() }
      },
      include: { assignedTo: true },
      orderBy: { deadline: "asc" },
      take: 5
    });

    return {
      teamPerformance: performance,
      topPerformer,
      mostDelayedTasks: delayedTasks.map(t => ({
        id: t.id,
        title: t.title,
        assignee: t.assignedTo.fullName || t.assignedTo.email,
        deadline: t.deadline
      }))
    };
  },

  /**
   * 1. LOGIC-BASED AUTOMATION (SMART TRIGGERS)
   */
  async checkSmartTriggers(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true }
    });

    if (!task) return;

    // Rule: IF Task status = “APPROVED” AND Milestone = completed -> mark as “High Risk”
    // (Following user prompt literally, even if it seems odd)
    if (task.status === "APPROVED") {
      const milestone = await prisma.milestone.findFirst({
        where: { projectId: task.projectId, status: "COMPLETED" }
      });

      if (milestone) {
        // Here we'd "mark as High Risk". Since there's no "risk" field in Project, 
        // let's assume we'd send an alert or update a project status if it existed.
        // For now, let's return it as a trigger result.
        return { trigger: "TASK_APPROVED_MILESTONE_COMPLETED", action: "MARK_HIGH_RISK" };
      }
    }
  },

  /**
   * 11. EXECUTIVE DASHBOARD
   */
  async getExecutiveDashboard() {
    try {
      const projects = await prisma.project.findMany();
      const users = await prisma.user.findMany();

      const projectRisks = await Promise.all(projects.map(async p => ({
        id: p.id,
        name: p.name,
        risk: await this.getProjectRisk(p.id)
      })));

      const employeeRisks = await Promise.all(users.map(async u => ({
        id: u.id,
        name: u.fullName || u.email,
        risk: await this.getEmployeeRisk(u.id)
      })));

      const workload = await this.getWorkloadSuggestions();

      const atRiskProjects = projectRisks.filter(p => p.risk === "At Risk");
      const overloadedEmployees = workload.overloaded;

      // Company health score (average project progress)
      const progresses = await Promise.all(projects.map(p => this.getProjectProgress(p.id)));
      const healthScore = progresses.length > 0 
        ? Math.round(progresses.reduce((acc, p) => acc + p.percentage, 0) / progresses.length)
        : 100;

      return {
        companyHealthScore: healthScore,
        atRiskProjects,
        overloadedEmployees,
        weeklySummary: await this.generateWeeklyReport()
      };
    } catch (error: any) {
      console.error("PRISMA ERROR in getExecutiveDashboard:", error);
      if (error.code) console.error("Error Code:", error.code);
      if (error.meta) console.error("Error Meta:", JSON.stringify(error.meta));
      if (error.message) console.error("Error Message:", error.message);
      throw error;
    }
  },

  /**
   * 9. SMART ALERT SYSTEM (LOGIC BASED)
   */
  async getSmartAlerts() {
    const alerts: any[] = [];

    // 1. Task overdue
    const overdueTasks = await prisma.task.findMany({
      where: {
        status: { not: "APPROVED" },
        deadline: { lt: new Date() }
      },
      include: { assignedTo: true }
    });
    overdueTasks.forEach(t => {
      alerts.push({
        type: "TASK_OVERDUE",
        message: `Task "${t.title}" is overdue`,
        assignee: t.assignedTo.fullName || t.assignedTo.email
      });
    });

    // 2. Dependency cleared
    // A dependency is "cleared" if the dependencyTask is APPROVED
    const tasksWithDependencies = await prisma.task.findMany({
      where: {
        dependencyTaskId: { not: null },
        status: "TODO"
      },
      include: { dependencyTask: true, assignedTo: true }
    });
    tasksWithDependencies.forEach(t => {
      if (t.dependencyTask?.status === "APPROVED") {
        alerts.push({
          type: "DEPENDENCY_CLEARED",
          message: `Task "${t.title}" can now be started (dependency cleared)`,
          assignee: t.assignedTo.fullName || t.assignedTo.email
        });
      }
    });

    // 3. Employee overloaded
    const workload = await this.getWorkloadSuggestions();
    workload.overloaded.forEach(u => {
      alerts.push({
        type: "EMPLOYEE_OVERLOADED",
        message: `Employee ${u.name} is overloaded with ${u.count} tasks`,
        userId: u.id
      });
    });

    // 4. Project risk
    const projects = await prisma.project.findMany();
    for (const p of projects) {
      const risk = await this.getProjectRisk(p.id);
      if (risk === "At Risk") {
        const alert = {
          type: "PROJECT_RISK",
          message: `Project "${p.name}" is marked as AT RISK`,
          projectId: p.id
        };
        alerts.push(alert);
        // Emit critical alert
        socketService.emitToProject(p.id, "critical_alert", alert);
      }
    }

    return alerts;
  },

  /**
   * 10. DECISION SUPPORT PANEL
   */
  async getDecisionSupport() {
    const alerts = await this.getSmartAlerts();
    const workload = await this.getWorkloadSuggestions();
    const priorities = await this.getPrioritySuggestions();

    const suggestions: string[] = [...workload.suggestions];

    // Additional decision logic
    const atRiskProjects = alerts.filter(a => a.type === "PROJECT_RISK");
    if (atRiskProjects.length > 0) {
      suggestions.push("Consider extending deadlines for tasks in 'At Risk' projects");
    }

    const overloadedCount = workload.overloaded.length;
    if (overloadedCount > 0.5 * (await prisma.user.count())) {
      suggestions.push("More than 50% of the team is overloaded. Consider adding more resources or postponing non-critical tasks.");
    }

    return {
      alerts,
      priorities,
      workload,
      suggestions
    };
  }
};
