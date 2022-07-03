import { Form, ActionPanel, Action, showToast, Toast, getPreferenceValues } from "@raycast/api";
import { useEffect, useState } from "react";
import type { Tag } from "./Notion";
import { Notion } from "./Notion";
import { fetchArticle } from "./util";

type Values = {
  url: string;
  tags: string[];
  createdAt: Date | null;
};

export default function Command() {
  const preference = getPreferenceValues<{ auth: string; databaseId: string }>();
  const notionClient = new Notion(preference.auth);

  const [tags, setTags] = useState<Tag[]>([]);

  async function handleSubmit(values: Values) {
    showToast({ title: "saving...", style: Toast.Style.Animated });

    const { url, tags, createdAt } = values;
    const res = await fetchArticle(url);

    if (res.type === "success") {
      const { title, ogp } = res.data;
      const response = await notionClient.stockArticle(preference.databaseId, { title, url, ogp, tags, createdAt });
      if (response.type === "failure") {
        const { name, message } = response.err;
        showToast({ title: name, message: message, style: Toast.Style.Failure });
      } else {
        showToast({ title: "stocked article", style: Toast.Style.Success });
      }
    } else {
      const { name, message } = res.err;
      showToast({ title: name, message: message, style: Toast.Style.Failure });
    }
  }

  useEffect(() => {
    notionClient.fetchTags(preference.databaseId).then((res) => {
      if (res) {
        setTags(res);
      }
    });
  }, []);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="url" title="URL" placeholder="Enter url" />
      <Form.TagPicker id="tags" title="Tags">
        {tags.map((tag) => (
          <Form.TagPicker.Item key={tag.id + tag.name} value={tag.name} title={tag.name} />
        ))}
      </Form.TagPicker>
      <Form.DatePicker id="createdAt" title="createdAt" type={Form.DatePicker.Type.Date} />
    </Form>
  );
}
