from django.db import models
from urllib.parse import urljoin, urlsplit
from bs4 import BeautifulSoup
import requests
from requests_html import HTMLSession
from collections import Counter
from django.conf import settings
from django.template.defaultfilters import truncatechars
from openai import OpenAI
from decouple import config
import tiktoken
import time
import re

class Crawler:
    BLACKLIST_EXTENSIONS = [
        ".png", ".jpeg", ".jpg", ".gif", ".bmp", ".tiff", ".svg", ".webp", ".ico", ".pdf", ".doc",
        ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".zip", ".rar", ".7z", ".tar", ".gz", ".mp3", 
        ".wav", ".ogg", ".mp4", ".avi", ".mkv", ".mov", ".flv", ".wmv", ".exe", ".dll", ".bin", ".md"
    ]
    
    IGNORE_PATTERNS = [ "#", "feed", "comments", "mailto:", "tel:", "javascript:" ]

    def __init__(self, url):
        url = urlsplit(self.redirect_handler(url))
        self.domain = url.scheme + "://" + url.netloc + "/"
        self.pages = []
        self.queue = set()
        self.queue.add(url.path.lower())
        self.visited = set()
        self.crawl_site()

    def redirect_handler(self, url):
        try:
            response = requests.get(url, allow_redirects=True)
            return response.url
        except requests.exceptions.RequestException as e:
            print(f"Error occurred while handling redirect: {e}")
            return url

    def crawl_site(self):
        while self.queue:
            path = self.queue.pop()
            if path == '': path ='/'
            if path in self.visited or not self.is_valid_page(path):
                continue

            print(f"Crawling: {path}")
            self.visited.add(path)
            self.crawl_page(path)

    def is_valid_page(self, path):
        if any(path.endswith(ext) for ext in self.BLACKLIST_EXTENSIONS):
            return False
        if any(pattern in path for pattern in self.IGNORE_PATTERNS):
            return False
        return True

    def crawl_page(self, path):
        try:
            session = HTMLSession()
            response = session.get(self.domain + path)
            soup = BeautifulSoup(response.html.html, 'html.parser')
            if soup.title:
                if "Page not found" in soup.title.text:
                    return

            self.pages.append({
                'path': path,
                'html': soup,
                'text': self.clean_document(soup),
            })

            self.filter_links(soup)

        except Exception as e:
            print(f"Error crawling {path}: {e}")

    def filter_links(self, soup):
        body = soup.find('body')
        if not body:
            return

        for link in body.find_all('a', href=True):
            url = urlsplit(urljoin(self.domain, link['href']).lower())
            if url.netloc == urlsplit(self.domain).netloc:
                path = url.path
                if self.is_valid_page(path):
                    if path not in [u for u in self.visited] and path not in [u for u in self.queue]:
                        self.queue.add(path)

    def clean_document(self, soup):
        for tag in soup(['script', 'style', 'noscript', 'iframe', 'form', 'link', 'img']):
            tag.decompose()

        return soup.get_text(separator="\n", strip=True)

class Domain(models.Model):
    domain = models.URLField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name or self.url
    
class Ai:
    client = OpenAI(api_key=config('OPENAI_KEY'))
    
    def __init__(self, content="", role="user", model="gpt-4o-mini"):
        self.encoder = tiktoken.encoding_for_model(model)
        self.model = model
        self.tokens = 0
        self.text = ''
        self.messages = []
        self.response = []

    def addMsg(self, content='',  role="user"):
        self.messages.append({"role": role, "content": content})

    def addTxt(self, content=''):
        self.text += content + ' '

    def split_by_tokens(self, text='', max_tokens=50000):
        tokens = self.encoder.encode(text)
        chunks = []
        for i in range(0, len(tokens), max_tokens):
            chunk_tokens = tokens[i:i+max_tokens]
            chunk_text = self.encoder.decode(chunk_tokens)
            chunks.append([{"role": "user", "content": chunk_text}])

        return chunks

    def remove_dup_sentence(self):
        sentences = re.split(r'(?<=[.!?]) +', self.text)
        unique_sentences = list(dict.fromkeys(sentences))
        return ' '.join(unique_sentences)

    def send(self, compact=False):
        temp = self.text
        if compact == True:
            temp = self.remove_dup_sentence()

        chunks = self.split_by_tokens(temp)
        chunks.append(self.messages)

        for message in chunks:
            print(f'{chunks.index(message) + 1}/{len(chunks)} received.')
            res= self.client.chat.completions.create(
                model=self.model,
                messages=message
            )
            self.response.append(res.choices[0].message.content)
        return self.response   
    
class Page(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    domain = models.ForeignKey(Domain, related_name='pages', on_delete=models.CASCADE, null=True)
    path = models.CharField(max_length=255, default="")
    text = models.TextField(default="")
    html = models.TextField('HTML', default="")

    def __str__(self):
      return f"{self.base}{self.path}"
   
class Option(models.Model):
  name = models.CharField(max_length=200)
  value = models.TextField(default='')

  def __str__(self):
    return f"{self.id}. {self.name}"

  @property
  def short_description(self):
    return truncatechars(self.value, 100)

  def get(name):
    obj = Option.objects.filter(name=name).values()
    return obj[0]['value'] if (len(obj) > 0) else 'Item not found'
  
  def update(name, val):
    return Option.objects.update_or_create(name=name,value=val)[1]