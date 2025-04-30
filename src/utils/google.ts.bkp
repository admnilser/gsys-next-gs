import _ from "lodash";

import { fetchJson } from "./fetch";

import { gotoPage } from "./browser";

const GOOGLE_API_KEY = "AIzaSyAPzAlDmlitauW-io2J0-o8sBgdWiR6T4s";

const CUSTOM_SEARCH_CONTEXT = "37cb77e32179946f9";

export type GooglePriceItem = {
  url?: string;
  title?: string;
  thumb?: string;
  price?: string;
  seller?: string;
};

export type GoogleApiImageItem = {
  title: string;
  url: string;
  thumbnail: string;
};

export class GoogleApi {
  constructor() {}

  getImages(term: string): Promise<GoogleApiImageItem[]> {
    return fetchJson(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${CUSTOM_SEARCH_CONTEXT}&q=${term}`
    ).then((json: { items: any }) =>
      _.map(json.items, ({ title, pagemap }) => ({
        title,
        url: _.get(pagemap, ["cse_image", 0, "src"]),
        thumbnail: _.get(pagemap, ["cse_thumbnail", 0, "src"]),
      }))
    );
  }

  async getPrices(term: string) {
    return gotoPage<GooglePriceItem[]>(
      `https://www.google.com/search?sca_esv=602170251&q=${term}&tbm=shop`,
      async (page) => {
        return await page.evaluate(() => {
          var nodes = Array.from(
            document.querySelectorAll(".sh-dgr__content")
          ).slice(0, 25);

          return nodes.map(function (node) {
            var item: GooglePriceItem = {};

            var title = node.querySelector("h3");
            if (title) item.title = title.innerText;

            var thumb = node.querySelector("img");
            if (thumb) item.thumb = thumb.src;

            var oferLink = node.querySelector(
              ".sh-dgr__offer-content a:first-of-type"
            );
            if (oferLink) {
              var price = oferLink.querySelector<HTMLSpanElement>(
                "[aria-hidden=true] span:first-of-type"
              );
              if (price) item.price = price.innerText;

              var seller =
                oferLink.querySelector<HTMLDivElement>("div:last-of-type");
              if (seller) item.seller = seller.innerText;
            }

            return item;
          });
        });
      }
    );
  }
}

export default new GoogleApi();
