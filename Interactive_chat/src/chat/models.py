from django.db import models

# Create your models here.
class Conversation(models.Model):
    date = models.DateTimeField(null=True , blank = True,auto_now_add=True)
    user1 = models.CharField(max_length='60')
    user2 = models.CharField(max_length="60")
     
class Message(models.Model):
    conversation =models.ForeignKey(Conversation,related_name='conversation')
    user = models.CharField(max_length="60")
    text =models.CharField(max_length="500");
    date =models.DateTimeField(null=True,blank = True, auto_now_add=True)
    
    