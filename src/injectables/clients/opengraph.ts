import OgScraper from 'open-graph-scraper';

export async function scrape(url: string) {
  const res = await OgScraper({ url });

  if (res.error) {
    throw new Error(`Could not scrape ${url}`);
  }

  return res.result;
}
