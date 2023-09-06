from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Kullanici, Profile



# kaydolan kullanıcının profili oluşturulsun diye sinyal göndermeliyiz

@receiver(post_save, sender=Kullanici)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance, profile_image=instance.image)

@receiver(post_save, sender=Kullanici)
def save_user_profile(sender, instance, **kwargs):
    # Kullanıcının profil resmini güncelleme durumu için
    instance.profile.profile_image = instance.image
    instance.profile.save()
