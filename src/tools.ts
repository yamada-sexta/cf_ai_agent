/**
 * Tool definitions for the AI chat agent
 * Tools can either require human confirmation or execute automatically
 */
import { tool, type ToolSet } from "ai";
import { z } from "zod/v3";

import type { Chat } from "./server";
import { getCurrentAgent } from "agents";
import { scheduleSchema } from "agents/schedule";
import { Calc } from "calc-js";

/**
 * Weather information tool that requires human confirmation
 * When invoked, this will present a confirmation dialog to the user
 */
const getWeatherInformation = tool({
  description: "show the weather in a given city to the user",
  inputSchema: z.object({ city: z.string() })
  // Omitting execute function makes this tool require human confirmation
});

/**
 * Local time tool that executes automatically
 * Since it includes an execute function, it will run without user confirmation
 * This is suitable for low-risk operations that don't need oversight
 */
const getLocalTime = tool({
  description: "get the local time for a specified location",
  inputSchema: z.object({ location: z.string() }),
  execute: async ({ location }) => {
    console.log(`Getting local time for ${location}`);
    return "10am";
  }
});

const scheduleTask = tool({
  description: "A tool to schedule a task to be executed at a later time",
  inputSchema: scheduleSchema,
  execute: async ({ when, description }) => {
    // we can now read the agent context from the ALS store
    const { agent } = getCurrentAgent<Chat>();

    function throwError(msg: string): string {
      throw new Error(msg);
    }
    if (when.type === "no-schedule") {
      return "Not a valid schedule input";
    }
    const input =
      when.type === "scheduled"
        ? when.date // scheduled
        : when.type === "delayed"
          ? when.delayInSeconds // delayed
          : when.type === "cron"
            ? when.cron // cron
            : throwError("not a valid schedule input");
    try {
      agent!.schedule(input!, "executeTask", description);
    } catch (error) {
      console.error("error scheduling task", error);
      return `Error scheduling task: ${error}`;
    }
    return `Task scheduled for type "${when.type}" : ${input}`;
  }
});

/**
 * Tool to list all scheduled tasks
 * This executes automatically without requiring human confirmation
 */
const getScheduledTasks = tool({
  description: "List all tasks that have been scheduled",
  inputSchema: z.object({}),
  execute: async () => {
    const { agent } = getCurrentAgent<Chat>();

    try {
      const tasks = agent!.getSchedules();
      if (!tasks || tasks.length === 0) {
        return "No scheduled tasks found.";
      }
      return tasks;
    } catch (error) {
      console.error("Error listing scheduled tasks", error);
      return `Error listing scheduled tasks: ${error}`;
    }
  }
});

/**
 * Tool to cancel a scheduled task by its ID
 * This executes automatically without requiring human confirmation
 */
const cancelScheduledTask = tool({
  description: "Cancel a scheduled task using its ID",
  inputSchema: z.object({
    taskId: z.string().describe("The ID of the task to cancel")
  }),
  execute: async ({ taskId }) => {
    const { agent } = getCurrentAgent<Chat>();
    try {
      await agent!.cancelSchedule(taskId);
      return `Task ${taskId} has been successfully canceled.`;
    } catch (error) {
      console.error("Error canceling scheduled task", error);
      return `Error canceling task ${taskId}: ${error}`;
    }
  }
});

/**
 * Calculator tool that evaluates mathematical expressions
 * This executes automatically without requiring human confirmation
 */
const calculate = tool({
  description:
    "Evaluate a mathematical expression and return the result. Supports basic arithmetic, advanced math functions, and complex expressions.",
  inputSchema: z.object({
    expression: z
      .string()
      .describe(
        "The mathematical expression to evaluate (e.g., '2 + 2', 'sqrt(16)', 'sin(45)')"
      )
  }),
  execute: async ({ expression }) => {
    try {
      const parts = expression.split(" ");
      const Symbols = ["+", "-", "*", "/"] as const;
      type Token = number | (typeof Symbols)[number];
      const tokens: Token[] = [];
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].toLowerCase() === "pi") {
          parts[i] = Math.PI.toString();
        } else if (parts[i].toLowerCase() === "e") {
          parts[i] = Math.E.toString();
        }
      }
      for (let i = 0; i < parts.length; i++) {
        if (Symbols.includes(parts[i] as (typeof Symbols)[number])) {
          tokens.push(parts[i] as (typeof Symbols)[number]);
        } else {
          const num = parseFloat(parts[i]);
          if (!isNaN(num)) {
            tokens.push(num);
          } else {
            return `Invalid token "${parts[i]}" in expression.`;
          }
        }
      }
      if (tokens.length < 2) {
        return `Please provide at least two numbers to perform a calculation.`;
      }
      if (typeof tokens[0] !== "number") {
        return `Expression must start with a number.`;
      }
      const calc = new Calc(tokens[0] as number);
      for (let i = 1; i < tokens.length; i += 2) {
        const operator = tokens[i];
        const nextToken = tokens[i + 1];
        if (typeof nextToken !== "number") {
          return `Expected a number after operator "${operator}".`;
        }
        switch (operator) {
          case "+":
            calc.sum(nextToken as number);
            break;
          case "-":
            calc.minus(nextToken as number);
            break;
          case "*":
            calc.multiply(nextToken as number);
            break;
          case "/":
            calc.divide(nextToken as number);
            break;
          default:
            return `Unsupported operator "${operator}".`;
        }
      }
      // return calc.value;

      // const calc = new Calc();
      return `${expression} = ${calc.finish()}`;
    } catch (error) {
      console.error("Error evaluating expression", error);
      return `Error evaluating expression "${expression}": ${error}`;
    }
  }
});

/**
 * Export all available tools
 * These will be provided to the AI model to describe available capabilities
 */
export const tools = {
  getWeatherInformation,
  getLocalTime,
  scheduleTask,
  getScheduledTasks,
  cancelScheduledTask,
  calculate
} satisfies ToolSet;

/**
 * Implementation of confirmation-required tools
 * This object contains the actual logic for tools that need human approval
 * Each function here corresponds to a tool above that doesn't have an execute function
 */
export const executions = {
  getWeatherInformation: async ({ city }: { city: string }) => {
    console.log(`Getting weather information for ${city}`);
    return `The weather in ${city} is sunny`;
  }
};
