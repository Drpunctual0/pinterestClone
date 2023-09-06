
from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from django.utils import timezone
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

# Create your models here.

class Board(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="boards", null=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="created_boards", null=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_on = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return self.title

class UploadedMedia(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.CASCADE)
    file = models.FileField(upload_to='uploaded_media/')
    uploaded_at = models.DateTimeField(default=timezone.now)


    def __str__(self):
        return self.file.name

class Pin(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='pins', null=True, blank=True)
    link = models.URLField(null=True, blank=True, default="")
    title = models.CharField(max_length=200)
    image = models.CharField(max_length=500)
    description = models.TextField()


    def __str__(self):
        return self.title


class IdeaPin(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='idea_pins', null=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    # image = models.ImageField(upload_to='idea_pins/', null=True, blank=True)
    image = models.CharField(max_length=500)
    video = models.FileField(upload_to='videos/', null=True, blank=True)
    materials = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.title
    

class Reaction(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True)
    object_id = models.PositiveIntegerField(null=True)
    content_object = GenericForeignKey('content_type', 'object_id')

    emoji_url = models.URLField() 

    class Meta:
        unique_together = ['user', 'content_type', 'object_id']




class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True)
    object_id = models.PositiveIntegerField(null=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    content = models.TextField(null=False)
    created_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        title = "Başlıksız Nesne"  # Eğer content_object None ise ya da başlığı yoksa bu değeri kullanırız
        if self.content_object:
            title = getattr(self.content_object, 'title', title)
        return f'Comment by {self.user.username} on {title}'