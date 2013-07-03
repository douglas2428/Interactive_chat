from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'chat.views.chat', name='chat'),
    url(r'prueba', 'chat.views.prueba'),
    url(r'conversation', 'chat.views.conversation'),
    url(r'messages', 'chat.views.messages'),
    # url(r'^chatnode/', include('chatnode.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
