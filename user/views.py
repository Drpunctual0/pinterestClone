from django.views.decorators.csrf import csrf_protect
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from .forms import *
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_POST

@csrf_protect
def register(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            form.save()  
            messages.success(request, 'Kayıt başarılı.')
            return redirect('index')
        else:
            messages.error(request, 'Kayıt başarısız. Lütfen tekrar deneyin.')
            for error in form.errors:
                messages.error(request, form.errors[error])
            return redirect('index')
    else:
        form = CustomUserCreationForm()
    return render(request, 'index.html', {'form': form})

@csrf_protect
def userLogin(request):
    if request.method == 'POST':
        email = request.POST['email']
        password = request.POST['password']
        user = authenticate(request, email=email, password=password)
        if user is not None:
            auth_login(request, user) 
            messages.success(request, 'Giriş başarılı.')
            return redirect('board:board')
        else:
            messages.error(request, 'Giriş başarısız. Lütfen e-posta ve şifrenizi kontrol edin.')
            return redirect('index')
    return render(request, 'board.html')

@csrf_protect
def userLogout(request):
    auth_logout(request)
    messages.success(request, 'Çıkış başarılı.')
    return redirect('index')



def profile_view(request, user_id):
    user = request.user
    viewed_user = Kullanici.objects.get(id=user_id)
    if not user:
        return redirect('base')

    context = {
        'user': user,
        'viewed_user': viewed_user,
    }

    return render(request, 'profile_view.html', context)




def my_profile(request):
    return profile_view(request, user_id=request.user.id)





def profile_edit(request):
    if request.method == 'POST':
        form = CustomUserChangeForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            return redirect('user:profile_view', user_id=request.user.id)

    else:
        form = CustomUserChangeForm(instance=request.user)

    context = {'form': form}
    return render(request, 'profile_edit.html', context)



@require_POST
def follow_user(request, user_id):
    if request.method == "POST":
        user_to_follow = get_object_or_404(Kullanici, id=user_id)
        request.user.following.add(user_to_follow)
        return JsonResponse({"status": "followed"}, status=200)
    return JsonResponse({}, status=400)



@require_POST
def unfollow_user(request, user_id):
    if request.method == "POST":
        user_to_unfollow = get_object_or_404(Kullanici, id=user_id)
        request.user.following.remove(user_to_unfollow)
        return JsonResponse({"status": "unfollowed"}, status=200)
    return JsonResponse({}, status=400)