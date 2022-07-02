import { APIResponseError, Client } from "@notionhq/client";
import type { CreatePageParameters } from "@notionhq/client/build/src/api-endpoints";
import { Result } from "./types";

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
};

export class Notion {
  #client: Client;

  constructor(auth: string) {
    this.#client = new Client({
      auth,
    });
  }

  public async stockArticle(databaseId: string, { title, url, ogp, tags: tags }: ArticleProp): Promise<Result<string>> {
    const parameters: CreatePageParameters = {
      parent: { database_id: databaseId },
      properties: {
        Title: {
          title: [
            {
              text: { content: title },
            },
          ],
          type: "title",
        },
        URL: {
          url,
          type: "url",
        },
      },
    };

    if (tags.length > 0) {
      const multiSelect = tags.map((tag) => ({ name: tag }));
      parameters.properties.Tags = {
        multi_select: multiSelect,
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
      await this.#client.pages.create(parameters);

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

  public async fetchTags(databaseId: string): Promise<Tag[] | undefined> {
    const response = await this.#client.databases.retrieve({ database_id: databaseId });
    const tags = response.properties.Tags;
    if (tags.type === "multi_select") {
      return tags.multi_select.options;
    }
  }
}
