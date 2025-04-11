from django.shortcuts import render
from django.http import JsonResponse
import json
from .models import Crawler
from openai import OpenAI
from decouple import config

client = OpenAI(api_key=config('OPENAI_KEY'))

def home_view(request):
    return render(request, 'base.html')

def url_view(request):
    dt = json.loads(request.body)
    website = Crawler(dt['url'])
    data = []
    msg = []
    for page in website.page_list:
        msg.append({"role": "user", "content": page["text"]})
        data.append({
            "url": {
                "scheme": page["url"].scheme,
                "netloc": page["url"].netloc,
                "path": page["url"].path,
                "fragment": page["url"].fragment,
                "query": page["url"].query,
            },
            "html": str(page["html"])
        })
    msg.append({"role": "user", "content": "Find 10 most common terms on site"})
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=msg
    )
    return JsonResponse({ 
        "data": data,
        "ai_response": response.choices[0].message.content
    })