from django import forms
from .models import *



class BoardForm(forms.ModelForm):
    class Meta:
        model = Board
        fields = ['title', 'description']


class UploadMediaForm(forms.ModelForm):
    class Meta:
        model = UploadedMedia
        fields = ['file']

class PinForm(forms.ModelForm):
    image_url = forms.CharField(widget=forms.HiddenInput())  
    
    class Meta:
        model = Pin
        fields = ['title', 'image_url', 'description', 'link']  

class IdeaPinForm(forms.ModelForm):
    image = forms.CharField(required=False, widget=forms.HiddenInput()) 
    
    class Meta:
        model = IdeaPin
        fields = ['title', 'description', 'image', 'board']




class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['content']

