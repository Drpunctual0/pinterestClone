# Generated by Django 4.2.4 on 2023-09-02 16:06

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('board', '0012_remove_pin_likes'),
    ]

    operations = [
        migrations.AddField(
            model_name='pin',
            name='likes',
            field=models.ManyToManyField(related_name='likes', to=settings.AUTH_USER_MODEL),
        ),
    ]
