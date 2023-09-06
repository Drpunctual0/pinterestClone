# Generated by Django 4.2.4 on 2023-09-05 09:42

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0004_profile'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='profile',
            name='followed_by',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='following',
        ),
        migrations.AddField(
            model_name='kullanici',
            name='following',
            field=models.ManyToManyField(blank=True, related_name='followed_by', to=settings.AUTH_USER_MODEL),
        ),
    ]
