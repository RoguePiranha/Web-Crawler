from django.shortcuts import render
from django.http import JsonResponse

def home_view(request):
    return render(request, 'base.html')

def url_view(request):
    print(request)
    data = {
        "message": "Hello, Django!",
        "status": "success"
    }
    return JsonResponse(data)