import { getCollection, type CollectionEntry } from "astro:content";

export const getBlogPosts = async (): Promise<Array<CollectionEntry<"blog">>> => {
  try {
    const posts = await getCollection("blog");
    return posts.filter((post) => !post.id.startsWith("_"));
  } catch {
    return [];
  }
};
