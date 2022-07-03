import fetch from "isomorphic-fetch";
import { parseDocument } from "htmlparser2";
import { findOne, getAttributeValue, getElementsByTagName, hasAttrib, textContent } from "domutils";
import type { Element, Document } from "domhandler";
import type { Result } from "./types";

type ParsedDOM = {
  title: string;
  ogp: string | undefined;
};

export async function fetchArticle(url: string): Promise<Result<ParsedDOM>> {
  try {
    const res = await fetch(url, { method: "GET" });
    const html = await res.text();
    const parsedDOM = parseDOM(html);

    return {
      type: "success",
      data: parsedDOM,
    };
  } catch (err) {
    if (err instanceof TypeError) {
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
        name: "fetch error",
        message: "unexpected error has occurred.",
      },
    };
  }
}

function parseDOM(html: string) {
  const document = parseDocument(html);
  const title = getTitle(document);
  const ogp = getOGP(document);

  return { title, ogp };
}

function isOGP(elem: Element): boolean {
  return getAttributeValue(elem, "property") === "og:image" && hasAttrib(elem, "content");
}

function getOGP(document: Document): string | undefined {
  const metaElements = getElementsByTagName("meta", document);
  const hasOGP = findOne(isOGP, metaElements);
  if (!hasOGP) {
    return undefined;
  }

  return getAttributeValue(hasOGP, "content");
}

function getTitle(document: Document): string {
  return textContent(getElementsByTagName("title", document));
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString();
  const day = date.getDate().toString();

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
