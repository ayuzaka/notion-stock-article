import { APIResponseError, Client } from "@notionhq/client";
import type { CreatePageParameters } from "@notionhq/client/build/src/api-endpoints";
import { useCallback } from "react";
import { Result } from "./types";
import { formatDate } from "./util";

export type Tag = {
  name: string;
  id?: string;
  color?: string;
};

type ArticleProp = {
  title: string;
  url: string;
  ogp: string | undefined;
  tags: string[];
  createdAt: Date | null;
};

export function useNotion(auth: string) {
  const client = new Client({ auth });

  const stockArticle = useCallback(async (databaseId: string, articleProps: ArticleProp): Promise<Result<string>> => {
    const { title, url, ogp, tags, createdAt } = articleProps;

    const parameters: CreatePageParameters = {
      parent: { database_id: databaseId },
      properties: {
        Title: {
          type: "title",
          title: [{ text: { content: title } }],
        },
        URL: { type: "url", url },
      },
    };

    if (tags.length > 0) {
      const multiSelect = tags.map((tag) => ({ name: tag }));
      parameters.properties.Tags = {
        multi_select: multiSelect,
      };
    }

    if (createdAt) {
      parameters.properties.CreatedAt = {
        type: "date",
        date: { start: formatDate(createdAt) },
      };
    }

    if (ogp) {
      parameters.cover = {
        type: "external",
        external: {
          url: ogp,
        },
      };
    }

    try {
      await client.pages.create(parameters);

      return {
        type: "success",
        data: "ok",
      };
    } catch (err) {
      if (err instanceof APIResponseError) {
        return {
          type: "failure",
          err: {
            name: err.name,
            message: err.message,
          },
        };
      }

      return {
        type: "failure",
        err: {
          name: "create page error",
          message: "failed to stock article",
        },
      };
    }
  }, []);

  const fetchTags = useCallback(async (databaseId: string) => {
    const response = await client.databases.retrieve({ database_id: databaseId });
    const tags = response.properties.Tags;
    if (tags.type === "multi_select") {
      return tags.multi_select.options;
    }
  }, []);

  return { stockArticle, fetchTags };
}
