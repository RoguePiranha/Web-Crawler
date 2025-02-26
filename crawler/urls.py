from django.urls import path
from . import views

urlpatterns = [
  path('', views.home_view, name='home'),
  path('url/', views.url_view, name='url'),
]