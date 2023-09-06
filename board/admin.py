from django.contrib import admin
from .models import *
# Register your models here.

@admin.register(Pin)
class PinAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'image']

@admin.register(IdeaPin)
class IdeaPinAdmin(admin.ModelAdmin):
    list_display = ['user', 'title',] 
    search_fields = ['title', 'user__username']  


admin.site.register(UploadedMedia)


class ReactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'related_object', 'emoji_url']
    search_fields = ['user__username', 'emoji_url']

    def related_object(self, obj):
        return str(obj.content_object)
    related_object.short_description = 'Related Object'

admin.site.register(Reaction, ReactionAdmin)

admin.site.register(Board)
admin.site.register(Comment)