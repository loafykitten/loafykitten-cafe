import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "zod";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  }),
});

export const collections = { blog };
