from urllib.parse import urljoin, urlparse
import requests
import bs4
from bs4 import BeautifulSoup
import xml.etree.ElementTree as ET
import pandas as pd
import re
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class CompetitorCrawler:
    URL = "url"
    PRICING_INFO = "pricing_info"
    SPEED_INFO = "speed_info"
    DATA_CAPS = "data_caps"
    KEYWORDS = "keywords"
    DESCRIPTION = "description"
    PRICES = "prices"
    SPEEDS = "speeds"

    def __init__(self, chrome_binary_path, chromedriver_path):
        # Initialize Selenium WebDriver
        chrome_options = Options()
        chrome_options.binary_location = chrome_binary_path
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        self.driver = webdriver.Chrome(service=Service(chromedriver_path), options=chrome_options)
        self.total_pages = 0  # Track the total number of pages visited
        self.visited_urls = set()  # Track all visited URLs to avoid duplicates

    # Function to fetch and parse the sitemap
    def get_sitemap_urls(self, base_url):

        sitemap_url = urljoin(base_url, "/sitemap.xml")
        try:
            response = requests.get(sitemap_url, verify=False)
            response.raise_for_status()

            sitemap_content = response.content
            root = ET.fromstring(sitemap_content)
            namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}

            urls = []
            for url in root.findall("ns:url", namespaces=namespace):
                loc_element = url.find("ns:loc", namespaces=namespace)
                if loc_element is not None:
                    loc = loc_element.text
                    if loc and "news" not in loc.lower() and "blog" not in loc.lower():
                        urls.append(loc)

            return urls

        except requests.exceptions.SSLError as e:
            print(f"SSL error encountered: {e}")
            return None
        
        except requests.exceptions.HTTPError as e:
            print(f"HTTP error encountered: {e}")
            return None
        
        except requests.exceptions.RequestException as e:
            print(f"Failed to fetch sitemap: {e}")
            return None
        
        except ET.ParseError as e:
            print(f"XML parsing error encountered: {e}")
            return None

    # Function to get the company name from the 'og:site_name' meta tag or fallback to the URL
    def get_company_name(self, base_url):
        self.driver.get(base_url)
        soup = BeautifulSoup(self.driver.page_source, 'html.parser')

        og_site_name = soup.find("meta", property="og:site_name")
        if og_site_name and isinstance(og_site_name, bs4.element.Tag) and og_site_name.has_attr("content"):
            return og_site_name["content"]

        return base_url.replace("https://", "").replace("www.", "").split(".")[0].capitalize()

    # Function to get all internal links from the <body> tag that match the base domain
    def get_internal_links(self, base_url, soup):
        body = soup.find('body')  # Find the <body> tag
        if not body:
            print(f"No body found in {base_url}")
            return set()

        internal_links = set()
        base_domain = urlparse(base_url).netloc

        for link in body.find_all('a', href=True):
            full_url = urljoin(base_url, link['href'])
            parsed_url = urlparse(full_url)

            if parsed_url.netloc == base_domain and full_url not in self.visited_urls and not parsed_url.fragment and not full_url.startswith("tel:") and not full_url.startswith("email:"):
                print(f"Found internal link: {full_url}")
                internal_links.add(full_url)

        return internal_links

    # Recursive function to crawl the website if no sitemap is found
    def crawl_site(self, base_url, count=0):
        if base_url in self.visited_urls:
            return [], [], count

        count += 1
        self.total_pages += 1  # Increment total pages visited
        print(f"Crawling {count}: {base_url}")
        self.visited_urls.add(base_url)

        try:
            # Open the page using Selenium
            self.driver.get(base_url)

            # Wait explicitly for elements that contain prices or speeds
            try:
                WebDriverWait(self.driver, 15).until(
                    EC.presence_of_element_located((By.TAG_NAME, "body"))
                )
                print(f"Body loaded for {base_url}")
            except Exception:
                print(f"Timeout waiting for body on {base_url}")


                try:
                    # Ensure body is visible by injecting JavaScript
                    self.driver.execute_script("""
                        var body = document.getElementsByTagName('body')[0];
                        body.style.opacity = '1';
                        body.style.visibility = 'visible';
                        body.style.display = 'block';
                    """)
                    print(f"Body tag visibility ensured for {base_url}")
                except Exception as e:
                    print(f"Error making body tag visible on {base_url}: {e}")

            soup = BeautifulSoup(self.driver.page_source, 'html.parser')

            # Gather data on this page
            page_data = self.scrape_competitor_info(base_url, soup)
            all_data = [page_data]
            plot_data = []

            # Collect all prices and speeds
            if page_data["prices"] and page_data["speeds"]:
                for price, speed in zip(page_data["prices"], page_data["speeds"]):
                    plot_data.append({
                        "url": base_url,
                        "price": price,
                        "speed": speed
                    })

            # Find and crawl all internal links from the <body> tag
            internal_links = self.get_internal_links(base_url, soup)

            if not internal_links:
                print(f"WARNING: No internal links found for {base_url}. Possible reasons:")
                print(f"  - Incorrect base URL?")
                print(f"  - No <body> tag in HTML?")
                print(f"  - Issue with URL resolving?")

            for link in internal_links:
                if link not in self.visited_urls:
                    time.sleep(0.1)  # Delay to avoid overwhelming the server
                    sub_data, sub_plot_data, count = self.crawl_site(link, count)
                    all_data.extend(sub_data)
                    plot_data.extend(sub_plot_data)

            return all_data, plot_data, count

        except Exception as e:
            print(f"Error crawling {base_url}: {e}")
            return [], [], count

    # Function to scrape competitor data from a single page
    def scrape_competitor_info(self, url, soup):
        pricing_info = soup.find_all(string=re.compile(r'\$\d+'))
        speed_info = soup.find_all(string=re.compile(r'\d+ Mbps'))
        data_caps = soup.find_all(string=re.compile(r'data cap', re.I))

        # Extract all prices and speeds
        prices = [float(match.group(1)) for price in pricing_info if (match := re.search(r'\$(\d+)', price))]
        speeds = [int(match.group(1)) for speed in speed_info if (match := re.search(r'(\d+)\s?Mbps', speed))]

        meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
        keywords = meta_keywords['content'] if meta_keywords and isinstance(meta_keywords, bs4.element.Tag) and meta_keywords.has_attr('content') else "No keywords found"

        meta_description = soup.find('meta', attrs={'name': 'description'})
        description = meta_description['content'] if meta_description and isinstance(meta_description, bs4.element.Tag) and meta_description.has_attr('content') else "No description found"

        return {
            "url": url,
            "pricing_info": pricing_info,
            "speed_info": speed_info,
            "data_caps": data_caps,
            "keywords": keywords,
            "description": description,
            "prices": prices,
            "speeds": speeds
        }

    # Function to gather data from the sitemap URLs or fallback to recursive crawl
    def gather_data_from_sitemap_or_crawl(self, base_url):
        sitemap_urls = self.get_sitemap_urls(base_url)
        all_data = []
        plot_data = []
        count = 0

        if sitemap_urls:
            print(f"Found {len(sitemap_urls)} URLs in sitemap for {base_url}.")
            for idx, url in enumerate(sitemap_urls):
                count += 1
                self.total_pages += 1
                print(f"Crawling {idx + 1}/{len(sitemap_urls)}: {url}")
                try:
                    self.driver.get(url)
                    soup = BeautifulSoup(self.driver.page_source, 'html.parser')
                    data = self.scrape_competitor_info(url, soup)
                    all_data.append(data)
                    if data["prices"] and data["speeds"]:
                        for price, speed in zip(data["prices"], data["speeds"]):
                            plot_data.append({
                                "url": url,
                                "price": price,
                                "speed": speed
                            })
                except Exception as e:
                    print(f"Error while crawling {url}: {e}")
                time.sleep(0.1)
        else:
            print(f"No sitemap found, falling back to crawling {base_url}")
            all_data, plot_data, count = self.crawl_site(base_url)

        return all_data, plot_data, count

    # Main function to initiate the crawl for all competitors
    def gather_competitor_data(self, competitor_urls):
        all_competitor_data = []
        plot_data = []
        total_counts = {}

        for url in competitor_urls:
            company_name = self.get_company_name(url)
            print(f"Starting crawl for: {company_name}")
            detailed_data, url_plot_data, total_count = self.gather_data_from_sitemap_or_crawl(url)
            all_competitor_data.extend(detailed_data)
            plot_data.extend(url_plot_data)
            total_counts[company_name] = total_count

        df_all_data = pd.DataFrame(all_competitor_data)
        df_plot_data = pd.DataFrame(plot_data)

        df_all_data.to_csv('output_all_data.csv', index=False)
        df_plot_data.to_csv('output_plot_data.csv', index=False)

        return df_all_data, df_plot_data, total_counts, self.total_pages


# Main script execution
if __name__ == "__main__":
    chrome_binary_path = r"C:\Users\akswa\Documents\chrome_driver\chrome-win64\chrome-win64\chrome.exe"
    chromedriver_path = r"C:\Users\akswa\Documents\chrome_driver\chromedriver-win64\chromedriver-win64\chromedriver.exe"

    crawler = CompetitorCrawler(chrome_binary_path, chromedriver_path)

    competitor_urls = [
        "https://pmt.org"
    ]

    data, plot_data, total_counts, total_pages = crawler.gather_competitor_data(competitor_urls)
    crawler.driver.quit()

    print(data)
    print(plot_data)

    print("\nCrawl completed successfully!\n")
    print("Total Individual Crawl Counts:")
    for company, count in total_counts.items():
        print(f"    {company}: {count}")
    print(f"Total pages crawled overall: {total_pages}")
    print("Data saved to output_all_data.csv and output_plot_data.csv")
