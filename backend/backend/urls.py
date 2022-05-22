"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path

from . import views

urlpatterns = [
    path('getTrackFeatures',views.getTrackFeatures,name='getTrackFeatures'),
    path('getRecommendations/content/cos/<slug:slug>',views.runContentCosineModel),
    path('getRecommendations/content/man/<slug:slug>',views.runContentManhattanModel),
    path('getRecommendations/collab/<slug:slug>',views.make_user_user_dataset),
    
]