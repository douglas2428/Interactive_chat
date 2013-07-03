# Create your views here.
from models import *
from django.shortcuts import render_to_response,HttpResponse,Http404
from django.views.decorators.csrf import csrf_exempt
import simplejson as json
from django.db.models import Q
from datetime import datetime
from django.core.context_processors import request
from django.template import RequestContext


def chat(request):
    return render_to_response('index.html')

@csrf_exempt
def prueba(request):
    #Esto no hace nada, es solo un ejemplo para ver la comunicacion entre django y node.js
    if request.method == "POST":
        print "En django"
        print request.POST.get('userName')
        
        userName=request.POST.get('userName')
        
        return HttpResponse(json.dumps({'userName':userName}), mimetype='application/json')
    else:
        raise Http404
    
    
@csrf_exempt
def conversation(request):
    if request.method == "POST":
        msg=request.POST
        
        if msg!=None:
           
            convs= Conversation.objects.filter( (Q(user1=msg['from']) & Q(user2=msg['to'])) | (Q(user2=msg['from']) & Q(user1=msg['to'])) )
           
            if convs:
                conv=convs[0]
            else:
                conv=Conversation.objects.create(user1=msg['from'],user2=msg['to'])
                conv.save()
                
            
            message=Message.objects.create(conversation=conv,user=msg['from'],text=msg['message'])
            message.save()
            
            return HttpResponse(json.dumps({'from':message.user,'message':message.text,'date':message.date.strftime('%Y-%m-%dT%H:%M:%S+00:00')}), mimetype='application/json')
        else:
            raise Http404
    else:
        raise Http404    
@csrf_exempt
def messages(request):
    
    
    if request.method == 'POST':
        
        users=request.POST
        if users!=None:
            messages=[]
            convs= Conversation.objects.filter( (Q(user1=users['user1']) & Q(user2=users['user2'])) | ((Q(user2=users['user1']) & Q(user1=users['user2']))) ) 
            if convs:
                conv=convs[0]
                msgs=Message.objects.filter(conversation=conv)
               
               
                for msg in msgs:
                    messages.append({'from':msg.user,
                                     'message':msg.text,
                                     'date':msg.date.strftime('%Y-%m-%dT%H:%M:%S+00:00')})
               
                  
            return HttpResponse(json.dumps({'messages':messages}),mimetype='application/json') 
        else:
            raise Http404    
    else:
        raise Http404

       
