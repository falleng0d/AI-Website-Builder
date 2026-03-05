import { Tool } from "ai";

type Toolkit = Record<string, Tool>;

// Define your toolkit
export const toolkit: Toolkit = {
  //getWeather: {
  //  description: "Get current weather for a location",
  //  parameters: z.object({
  //    location: z.string().describe("City name or zip code"),
  //    unit: z.enum(["celsius", "fahrenheit"]).default("celsius"),
  //  }),
  //},
};
