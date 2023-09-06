from django.shortcuts import render, redirect, get_object_or_404
from .models import *
from .forms import *
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
import json
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import FileSystemStorage
from django.http import Http404
from django.contrib.contenttypes.models import ContentType




@login_required
def home_feed(request):
    following_users = request.user.profile.following.all()
    pins = Pin.objects.filter(user__in=following_users)

    return render(request, 'board.html', {'pins': pins})


@login_required
def board(request):
    query = request.GET.get('q', None)  
    if query:
        pins = Pin.objects.filter(title__icontains=query) 
        idea_pins = IdeaPin.objects.filter(title__icontains=query)  
    else:
        pins = Pin.objects.all()  
        idea_pins = IdeaPin.objects.all()
    boards = Board.objects.filter(user=request.user)
    context = {
        'pins': pins,
        'idea_pins': idea_pins,
        'boards' : boards,
    }
    print("board fonksiyonu çağrıldı!")
    return render(request, 'board.html', context)



@login_required
def create_board(request):
    if request.method == "POST" and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        board_name = request.POST.get('board_name')
        if board_name:
            Board.objects.create(title=board_name, user=request.user)
            return JsonResponse({'status': 'success', 'message': 'Pano oluşturuldu'})
        else:
            return JsonResponse({'status': 'error', 'message': 'Pano ismi boş bırakılamaz'})
    return JsonResponse({'status': 'error', 'message': 'Geçersiz istek'})


@login_required
def delete_board(request, board_id):
    board = get_object_or_404(Board, id=board_id, user=request.user)
    board.delete()
    return JsonResponse({'status': 'success', 'message': 'Pano silindi'})



@login_required
def drag(request):
    boards = Board.objects.filter(user=request.user)
    media_url = request.session.get('last_uploaded_media_url', None)  # Medya URL'sini session değişkeninden alıyoruz.
    return render(request, 'drag.html', {'boards': boards, 'media_url': media_url})



@login_required
def upload_media(request):
    print(request.FILES)
    if request.method == 'POST':
        if request.FILES.get('image'):
            request.FILES['file'] = request.FILES['image']
        form = UploadMediaForm(request.POST, request.FILES)
        if form.is_valid():
            media = form.save(commit=False)
            media.user = request.user
            media.save()

            # Medya URL'sini session değişkenine kaydediyoruz.
            request.session['last_uploaded_media_url'] = media.file.url

            # Kontrol amaçlı eklenmiş print ifadeleri
            print("Dosya başarıyla yüklendi:", media.file.url)
            print("Session değişkenine kaydedilen URL:", request.session.get('last_uploaded_media_url'))

            return JsonResponse({'file_url': media.file.url})
        else:
            print("Form geçerli değil.")
            print(form.errors)
    return JsonResponse({'error': 'Bir hata meydana geldi.'})



@login_required
def create_pin(request):
    if request.method == 'POST':
        form = PinForm(request.POST, request.FILES)
        if form.is_valid():
            pin = form.save(commit=False)
            pin.user = request.user

            # Daha önce yüklenen medya URL'sini alıp bu URL'yi pin'in image field'ına atıyoruz.
            pin.image = request.session.get('last_uploaded_media_url', '')   

            pin.save()
            messages.success(request, 'Pin başarıyla oluşturuldu.')
            return redirect('board:pin_detail', pin.id) 
        else:
            messages.error(request, 'Form geçerli değil. Lütfen tekrar deneyin.')
            print("Form verisi:", request.POST)
            print("Form hataları:", form.errors)
    else:
        form = PinForm()
    context = {
        'form':form,
        'user': request.user,
    }
    return render(request, 'create_pin.html', context)

@login_required
def create_idea_pin(request):
    if request.method == 'POST':
        image_url_from_session = request.POST.get('image_url', '')
        print("SessionStorage'dan alınan image URL:", image_url_from_session) 
        
        form_data = request.POST.copy()
        form_data['image_url'] = request.session.get('last_uploaded_media_url', '')
        
        print("Atanan Image URL:", form_data['image_url']) 

        form = IdeaPinForm(form_data, request.FILES)
        if form.is_valid():
            idea_pin = form.save(commit=False)
            idea_pin.user = request.user
            idea_pin.save()
            return redirect('board:board') 
        else:
            messages.error(request, 'Form geçerli değil. Lütfen tekrar deneyin.')
    else:
        form = IdeaPinForm()
    boards = Board.objects.filter(user=request.user) 
    context = {
        'form': form,
        'boards': boards,
    }
    return render(request, 'idea_pin.html', context)

            



@login_required
def pin_detail(request, model_name, pin_id):
    if model_name == "pin":
        obj = get_object_or_404(Pin, id=pin_id)
        content_type = ContentType.objects.get_for_model(Pin)
    elif model_name == "ideapin":
        obj = get_object_or_404(IdeaPin, id=pin_id)
        content_type = ContentType.objects.get_for_model(IdeaPin)
    else:
        raise Http404("Invalid model name")
    
    comments = Comment.objects.filter(content_type=content_type, object_id=obj.id)  # Yorumları bu şekilde alcan

    unique_reactions_for_pin = Reaction.objects.filter(content_type=content_type, object_id=obj.id).values('emoji_url').distinct()
    boards = Board.objects.filter(user=request.user)
    
    if request.method == "POST":
        comment_form = CommentForm(request.POST)
        if comment_form.is_valid():
            comment = comment_form.save(commit=False)
            comment.content_type = content_type
            comment.object_id = obj.id
            comment.user = request.user
            comment.save()
    else:
        comment_form = CommentForm()

    context = {
        'obj': obj,
        'comments': comments,
        'comment_form': comment_form, 
        'unique_reactions_for_pin': unique_reactions_for_pin,
        'boards': boards
    }
    return render(request, 'pin_detail.html', context)




@csrf_exempt 
@login_required
def add_reaction(request, model_name, pin_id):
    if request.method == "POST" and request.user.is_authenticated:
        emoji_url = request.POST.get('emoji_url')
        remove_reaction = request.POST.get('remove', 'false') == 'true'
        
        if model_name == "pin":
            model = Pin
        elif model_name == "ideapin":
            model = IdeaPin
        else:
            return JsonResponse({"status": "error", "message": "Geersiz model ismi"})
        
        content_type = ContentType.objects.get_for_model(model)
        pin = get_object_or_404(model, id=pin_id)
        
        existing_reaction = Reaction.objects.filter(user=request.user, content_type=content_type, object_id=pin_id).first()
        
        if remove_reaction and existing_reaction:
            existing_reaction.delete()
        elif existing_reaction:
            existing_reaction.emoji_url = emoji_url
            existing_reaction.save()
        else:
            Reaction.objects.create(user=request.user, content_type=content_type, object_id=pin_id, emoji_url=emoji_url)
        
        reaction_count = Reaction.objects.filter(content_type=content_type, object_id=pin_id).count()
        unique_reactions_for_pin = Reaction.objects.filter(content_type=content_type, object_id=pin_id).values('emoji_url').distinct()

        return JsonResponse({
            "status": "success", 
            "new_reaction_count": reaction_count,
            "unique_reactions": list(unique_reactions_for_pin)
        })
    
    return JsonResponse({"status": "error"})



@login_required
def add_comment(request, model_name, pk):
    model_name = model_name.lower()
    content_type = ContentType.objects.get(app_label="board", model=model_name)
    obj = content_type.get_object_for_this_type(pk=pk)
    
    if request.method == "POST":
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.content_type = content_type
            comment.object_id = pk
            comment.user = request.user
            comment.save()
            
            # AJAX için JSON cevap döndür
            response_data = {
                "status": "success",
                "username": comment.user.username,
                "comment_content": comment.content,
                "comment_date": comment.created_on.strftime('%d %B %Y'),
                "user_image":  comment.user.image.url,
                "is_current_user": comment.user == request.user,
                "comment_id": comment.id 
            }
            return JsonResponse(response_data)
        else:
            print("Form errors:", form.errors) 
            errors = {field: error_list[0] for field, error_list in form.errors.as_data().items()}
            return JsonResponse({'status': 'error', 'error_message': 'Form geçerli değil.','form_errors': errors})
    else:
        form = CommentForm()

    context = {
        'obj': obj,
        'form': form,
    }
    
    return render(request, 'pin_detail.html', context)



@login_required
def delete_comment(request, pk):
    comment = get_object_or_404(Comment, pk=pk)
    
    related_object = comment.content_object

    if comment.user == request.user:
        comment.delete()
    if isinstance(related_object, Pin):
        return redirect('board:pin_detail', model_name="pin", pin_id=related_object.pk)
    elif isinstance(related_object, IdeaPin):
        return redirect('board:pin_detail', model_name="ideapin", pin_id=related_object.pk)
    else:
        raise Http404("Invalid model type")



@login_required
def delete_pin(request, pin_id):
    pin = get_object_or_404(Pin, id=pin_id)

    if request.method == "POST":
        pin.delete()
        return redirect('board:board')  

    return render(request, 'delete_pin.html', {'pin': pin})


@login_required
def save_pin_to_board(request):
    
    print("Fonksiyon başlatıldı")
    if request.method == "POST" and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        print("İstek POST ve AJAX")
        pin_id = request.POST.get('pin_id')
        board_id = request.POST.get('board_id')
        pin = IdeaPin.objects.get(id=pin_id)
        board = Board.objects.get(id=board_id)
        board.pins.add(pin)
        
        try:
            print("Pin alınıyor...")
            pin = Pin.objects.get(id=pin_id)
            print("Pin başarıyla alındı")
            
            print("Pano alınıyor...")
            board = Board.objects.get(id=board_id)
            print("Pano başarıyla alındı")
            
            # Pin'i bu panoya eklemeyi unutma
            print("Pin panoya ekleniyor...")
            board.pins.add(pin)
            print("Pin panoya eklendi")
            
            return JsonResponse({"status": "success"})
        except Pin.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Pin bulunamadı."})
        except Board.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Pano bulunamadı."})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)})
    return JsonResponse({"status": "error", "message": "Geçersiz istek."})


@login_required
def save_pin(request):
    if request.method == "POST":
        image_url = request.POST.get('image_url', None)
        
        form_data = request.POST.copy()
        if image_url:
            form_data['image'] = image_url
        print("Image URL:", image_url)
        print("Form Data:", form_data)

        form = IdeaPinForm(data=form_data)


        if form.is_valid():
            pin = form.save(commit=False)
            pin.user = request.user
            pin.save()
            return render(request, 'pin_detail.html', {'form': form, 'pin': pin})
        else:
            messages.error(request, "Form geçerli değil. Lütfen bilgileri kontrol edin.")
            print(form.errors)
            return render(request, 'pin_detail.html', {'form': form, 'pin': None, 'form_errors': form.errors})
    else:
        form = IdeaPinForm()
        return render(request, 'pin_detail.html', {'form': form, 'pin': None})
