import { useEffect, useState } from "react";
import type { Client } from "@notionhq/client";

export type Tag = {
  name: string;
  id?: string;
  color?: string;
};

export function useTags(client: Client, databaseId: string) {
  const [tags, setTags] = useState<Tag[] | undefined>(undefined);

  useEffect(() => {
    let ignore = false;

    client.databases
      .retrieve({ database_id: databaseId })
      .then((response) => response.properties.Tags)
      .then((tags) => {
        if (!ignore) {
          if (tags.type === "multi_select") {
            setTags(tags.multi_select.options);
          }
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return tags;
}
