import { APIResponseError, Client } from "@notionhq/client";
import type { CreatePageParameters } from "@notionhq/client/build/src/api-endpoints";
import type { Result } from "./types";
import { formatDate } from "./util";

type ArticleProp = {
  title: string;
  url: string;
  ogp: string | undefined;
  tags: string[];
  createdAt: Date | null;
};

export async function stockArticle(
  client: Client,
  databaseId: string,
  articleProps: ArticleProp
): Promise<Result<string>> {
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
    parameters.properties["Tags"] = {
      multi_select: multiSelect,
    };
  }

  if (createdAt) {
    parameters.properties["CreatedAt"] = {
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
}
