from django.db import models

# Create your models here.
class Crawler:
    BLACKLIST_EXTENSIONS = [
        ".png", ".jpeg", ".jpg", ".gif", ".bmp", ".tiff", ".svg", ".webp", ".ico", 
        ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".zip", ".rar", 
        ".7z", ".tar", ".gz", ".mp3", ".wav", ".ogg", ".mp4", ".avi", ".mkv", 
        ".mov", ".flv", ".wmv", ".exe", ".dll", ".bin"
    ]
    
    IGNORE_PATTERNS = [
        "#", "feed", "comments", "mailto:", "tel:", "javascript:"
    ]

    def __init__(self, url):
        self.url = urlsplit(self.redirect_handler(url))
        self.page_list = []
        self.url_queue = [self.url]
        self.visited_urls = set()
        self.keyword_counter = Counter()

        self.crawl_site()

    def redirect_handler(self, url):
        try:
            response = requests.get(url, allow_redirects=True)
            return response.url
        except requests.exceptions.RequestException as e:
            print(f"Error occurred while handling redirect: {e}")
            return url

    def crawl_site(self):
        while self.url_queue:
            current_url = self.url_queue.pop(0)
            if current_url in self.visited_urls or not self.is_valid_page(current_url):
                continue

            print(f"Crawling: {current_url.geturl()}")
            self.visited_urls.add(current_url)
            self.crawl_page(current_url)

    def is_valid_page(self, url):
        path = url.path.lower()
        if any(path.endswith(ext) for ext in self.BLACKLIST_EXTENSIONS):
            return False
        if any(pattern in url.geturl().lower() for pattern in self.IGNORE_PATTERNS):
            return False
        return True

    def crawl_page(self, url):
        try:
            session = HTMLSession()
            response = session.get(url.geturl())
            soup = BeautifulSoup(response.html.html, 'html.parser')

            page_data = self.scrape_competitor_info(url.geturl(), soup)
            self.page_list.append({
                'url': url,
                'data': page_data,
                'html': soup
            })

            self.keyword_counter.update(page_data['frequent_keywords'])
            self.filter_url_list(soup)


        except Exception as e:
            print(f"Error crawling {url.geturl()}: {e}")

    def filter_url_list(self, soup):
        base_domain = self.url.netloc
        body = soup.find('body')
        if not body:
            return

        for link in body.find_all('a', href=True):
            full_url = urljoin(self.url.geturl(), link['href'])
            parsed_url = urlsplit(full_url)

            if parsed_url.netloc == base_domain and self.is_valid_page(parsed_url):
                if full_url not in [u.geturl() for u in self.visited_urls] and full_url not in [u.geturl() for u in self.url_queue]:
                    self.url_queue.append(parsed_url)

    def scrape_competitor_info(self, url, soup):
        pricing_info = soup.find_all(string=re.compile(r'\$\d+'))
        speed_info = soup.find_all(string=re.compile(r'\d+ Mbps'))
        data_caps = soup.find_all(string=re.compile(r'data cap', re.I))

        prices = [float(match.group(1)) for price in pricing_info if (match := re.search(r'\$(\d+)', price))]
        speeds = [int(match.group(1)) for speed in speed_info if (match := re.search(r'(\d+)\s?Mbps', speed))]

        meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
        keywords = meta_keywords['content'] if meta_keywords and meta_keywords.has_attr('content') else "No keywords found"

        meta_description = soup.find('meta', attrs={'name': 'description'})
        description = meta_description['content'] if meta_description and meta_description.has_attr('content') else "No description found"

        frequent_keywords = self.extract_frequent_keywords(soup)

        return {
            "url": url,
            "prices": prices,
            "speeds": speeds,
            "keywords": keywords,
            "description": description,
            "data_caps": data_caps,
            "frequent_keywords": frequent_keywords
        }

    def extract_frequent_keywords(self, soup, top_n=10):
        text = soup.get_text(separator=' ')
        text = text.lower()
        text = text.translate(str.maketrans('', '', string.punctuation))
        words = text.split()
        stop_words = set(stopwords.words('english'))
        filtered_words = [word for word in words if word not in stop_words and word.isalpha()]
        word_counts = Counter(filtered_words)
        most_common = word_counts.most_common(top_n)
        return [keyword for keyword, _ in most_common]
