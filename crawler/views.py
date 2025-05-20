from django.shortcuts import render
from django.http import JsonResponse
from urllib.parse import urljoin, urlsplit
import json
from .models import Crawler
from openai import OpenAI
from decouple import config
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from .models import Page, Domain, Ai
from .serializers import PageSerializer

client = OpenAI(api_key=config('OPENAI_KEY'))
User = get_user_model()

def remove_4byte_chars(text):
    return ''.join(c for c in text if ord(c) <= 0xFFFF)

@login_required
def home_view(request):
    return render(request, 'base.html')

def url_view(request):
    dt = json.loads(request.body)
    filtered = { key: value for key, value in dt.items() if 'url_' in key }
    data = []
    msg = Ai()
    user = User.objects.get(pk=request.user.id)
    for key, value in filtered.items():
        website = dict()
        split = urlsplit(value)
        base_url = split.scheme + "://" + split.netloc + "/"
        if not Domain.objects.filter(domain=base_url).exists():
            crawler = Crawler(base_url)
            domain = Domain.objects.create(domain=base_url)
            for page in crawler.pages:
                pg = Page.objects.create(
                    domain = domain, 
                    path = page["path"], 
                    text = page["text"], 
                    html = remove_4byte_chars(page["html"].prettify()),
                    user = user
                )
                pg.save()

        domain = Domain.objects.get(domain=base_url)
        website["domain"] = domain.domain
        website["pages"] = PageSerializer(domain.pages.all(), many=True).data

        for page in website["pages"]: 
            msg.addTxt(f"page {page["path"]} \n\n {page["text"]} \n\n")
        data.append(website)

    # msg.addMsg(content="Wrap response HTML tags. do not use ```html", role="system")
    # msg.addMsg(f"Using previous context, {dt['prompt']}")
    response = msg.send()
    
    return JsonResponse({ 
        "data": data,
        # "ai_response": response.choices[0].message.content,
        "ai_response": response,
        "history": msg.history
    })